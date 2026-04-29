import Block from '@/models/blockModel';
import Like from '@/models/likeModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import redisClient from '@/utils/redis';
import { logger } from '@/lib/winston';
import User from '@/models/userModel';

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
    const cacheKeys = userIds.map((id) => `user:${id}`);

    let cachedUsers: any[] = [];
    try {
      cachedUsers =
        cacheKeys.length > 0 ? await redisClient.mGet(cacheKeys) : [];
    } catch {
      logger.warn('Redis mGet failed in postLikes');
    }

    const missedIds = userIds.filter((id, idx) => !cachedUsers[idx]);
    const missedUsers =
      missedIds.length > 0
        ? await User.find({ _id: { $in: missedIds }, active: true })
            .select('username profilePhoto firstName lastName')
            .lean()
        : [];

    if (missedUsers.length > 0) {
      try {
        const pipeline = redisClient.multi();
        missedUsers.forEach((user) => {
          pipeline.set(
            `user:${user._id}`,
            JSON.stringify({
              username: user.username,
              profilePhoto: user.profilePhoto,
              firstName: user.firstName,
              lastName: user.lastName,
            }),
            { EX: 24 * 60 * 60 },
          );
        });
        await pipeline.exec();
      } catch {
        logger.warn('Redis pipeline failed in storyLikes');
      }
    }

    const mongooseMap = new Map(missedUsers.map((u) => [u._id.toString(), u]));
    const users = filtered
      .map((like, idx) => {
        const userId = userIds[idx];
        const userData = cachedUsers[idx]
          ? JSON.parse(cachedUsers[idx]!)
          : mongooseMap.get(userId);
        if (!userData) return null;
        return {
          user: userData,
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
