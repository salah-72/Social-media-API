import Like from '@/models/likeModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import redisClient from '@/utils/redis';
import { logger } from '@/lib/winston';
import User from '@/models/userModel';
import { getUsersFromCache } from '@/utils/getUsersFromCache';

export const postLikes = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 40;
  const skip = (page - 1) * limit;

  const blockIds = req.blockIds;

  const likes = await Like.find({ post: postId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const filtered = likes.filter((like) => !blockIds?.has(like.user.toString()));
  const userIds = filtered.map((like) => like.user.toString());
  const usersData = await getUsersFromCache(userIds);

  const users = filtered
    .map((like, idx) => {
      if (!usersData[idx]) return null;
      return {
        user: usersData[idx],
        type: like.type,
        createdAt: like.createdAt,
        updatedAt: like.updatedAt,
      };
    })
    .filter(Boolean);

  const length = await Like.countDocuments({ post: postId });

  res.status(200).json({
    status: 'success',
    data: {
      page,
      limit,
      length,
      users,
    },
  });
});
