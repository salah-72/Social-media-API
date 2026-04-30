import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import redisClient from '@/utils/redis';
import { logger } from '@/lib/winston';
import User from '@/models/userModel';

export const suggestedFollowings = catchAsync(
  async (req: Request, res: Response) => {
    const myId = req.currentuser?._id;
    const BlocksIds = [...(req.blockIds ?? [])];

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const suggestedFollowings = await Follow.aggregate([
      {
        $match: {
          status: 'accepted',
          follower: myId,
        },
      },
      {
        $lookup: {
          from: 'follows',
          let: { followingId: '$following' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$follower', '$$followingId'] },
                    { $eq: ['$status', 'accepted'] },
                  ],
                },
              },
            },
          ],
          as: 'theirFollowings',
        },
      },
      { $unwind: '$theirFollowings' },
      {
        $match: {
          'theirFollowings.following': { $ne: [...BlocksIds, myId] },
        },
      },
      {
        $lookup: {
          from: 'follows',
          let: { suggestedId: '$theirFollowings.following', myId: myId },

          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$follower', '$$myId'] },
                    { $eq: ['$following', '$$suggestedId'] },
                    { $eq: ['$status', 'accepted'] },
                  ],
                },
              },
            },
          ],
          as: 'alreadyFollowing',
        },
      },
      { $match: { alreadyFollowing: { $eq: [] } } },
      {
        $group: {
          _id: '$theirFollowings.following',
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    const userIds = suggestedFollowings.map((e) => e._id.toString());
    const cacheKeys = userIds.map((id) => `user:${id}`);

    let cachedUsers: (string | null)[] = [];
    try {
      cachedUsers = cacheKeys.length ? await redisClient.mGet(cacheKeys) : [];
    } catch {
      logger.warn('Redis mGet failed in mutualFollowers');
    }
    const missedIds = userIds.filter((_, i) => !cachedUsers[i]);
    const missedUsers = missedIds.length
      ? await User.find({ _id: { $in: missedIds }, active: true })
          .select('username profilePhoto firstName lastName')
          .lean()
      : [];

    if (missedUsers.length) {
      try {
        const pipeline = redisClient.multi();
        missedUsers.forEach((u) => {
          pipeline.set(
            `user:${u._id}`,
            JSON.stringify({
              username: u.username,
              profilePhoto: u.profilePhoto,
              firstName: u.firstName,
              lastName: u.lastName,
            }),
            { EX: 24 * 60 * 60 },
          );
        });
        await pipeline.exec();
      } catch {
        logger.warn('Redis pipeline failed in mutualFollowers');
      }
    }

    const mongooseMap = new Map(missedUsers.map((u) => [u._id.toString(), u]));

    const result = userIds
      .map((id, i) => {
        const userData = cachedUsers[i]
          ? JSON.parse(cachedUsers[i]!)
          : mongooseMap.get(id);
        if (!userData) return null;
        return { user: userData };
      })
      .filter(Boolean);

    res.status(200).json({
      status: 'success',
      data: {
        page,
        limit,
        length: result.length,
        suggestedFollowings: result,
      },
    });
  },
);
