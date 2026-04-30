import Follow from '@/models/followModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import redisClient from '@/utils/redis';
import { logger } from '@/lib/winston';
import User from '@/models/userModel';
import { getUsersFromCache } from '@/utils/getUsersFromCache';

export const getMyFollowers = catchAsync(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const followers = await Follow.find({
      following: req.currentuser?._id,
      status: 'accepted',
    })
      .select('follower -_id')
      .skip(skip)
      .limit(limit)
      .lean();

    const userIds = followers.map((e) => e.follower.toString());
    const followerss = await getUsersFromCache(userIds);
    const followersData = followerss
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
        length: followers.length,
        followersData,
      },
    });
  },
);
