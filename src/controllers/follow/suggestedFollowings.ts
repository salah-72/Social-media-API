import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import redisClient from '@/utils/redis';
import { logger } from '@/lib/winston';
import User from '@/models/userModel';
import { getUsersFromCache } from '@/utils/getUsersFromCache';

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
    const users = await getUsersFromCache(userIds);
    const result = users
      .map((userData) => {
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
