import Block from '@/models/blockModel';
import Like from '@/models/likeModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import redisClient from '@/utils/redis';
import { logger } from '@/lib/winston';
import User from '@/models/userModel';
import { getUsersFromCache } from '@/utils/getUsersFromCache';

export const reaction = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId, type } = req.params;

    const allowedTypes = [
      'like',
      'love',
      'care',
      'sad',
      'angry',
      'haha',
      'wow',
    ];
    if (!allowedTypes.includes(type))
      return next(new appError('invalid reaction type', 400));

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 40;
    const skip = (page - 1) * limit;

    const blockIds = req.blockIds;

    const likes = await Like.find({ post: postId, type })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const filtered = likes.filter(
      (like) => !blockIds?.has(like.user.toString()),
    );
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

    const length = await Like.countDocuments({ post: postId, type });

    res.status(200).json({
      status: 'success',
      data: {
        page,
        limit,
        length,
        users,
      },
    });
  },
);
