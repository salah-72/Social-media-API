import { logger } from '@/lib/winston';
import redisClient from '@/utils/redis';
import Follow from '@/models/followModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import User from '@/models/userModel';
import { getUsersFromCache } from '@/utils/getUsersFromCache';

export const getUserFollowings = catchAsync(
  async (req: Request, res: Response) => {
    const blockIds = req.blockIds || new Set();

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const followings = await Follow.find({
      follower: req.targetUser?._id,
      status: 'accepted',
    })
      .select('following -_id')
      .skip(skip)
      .limit(limit)
      .lean();

    const filtered = followings.filter(
      (e) => !blockIds.has(e.following.toString()),
    );
    const userIds = filtered.map((e) => e.following.toString());
    const followingsFromCache = await getUsersFromCache(userIds);
    const followingsData = followingsFromCache
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
        length: followings.length,
        followingsData,
      },
    });
  },
);
