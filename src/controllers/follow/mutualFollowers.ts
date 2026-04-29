import { logger } from '@/lib/winston';
import Follow from '@/models/followModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import redisClient from '@/utils/redis';
import User from '@/models/userModel';

export const mutualFollowers = catchAsync(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const mutualFollowers = await Follow.aggregate([
      {
        $match: {
          following: req.targetUser?._id,
          status: 'accepted',
        },
      },
      {
        $lookup: {
          from: 'follows',
          let: { followerId: '$follower' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$follower', '$$followerId'] },
                    { $eq: ['$following', req.currentuser?._id] },
                    { $eq: ['$status', 'accepted'] },
                  ],
                },
              },
            },
          ],
          as: 'isMutual',
        },
      },
      {
        $match: {
          isMutual: { $ne: [] },
        },
      },
      { $skip: skip },
      { $limit: limit },
      { $project: { _id: 0, follower: 1 } },
    ]);

    const userIds = mutualFollowers.map((e) => e.follower.toString());
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
        mutualFollowers: result,
      },
    });
  },
);
