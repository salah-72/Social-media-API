import Block from '@/models/blockModel';
import Like from '@/models/likeModel';
import Story from '@/models/storyModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import redisClient from '@/utils/redis';
import { logger } from '@/lib/winston';
import User from '@/models/userModel';
import { getUsersFromCache } from '@/utils/getUsersFromCache';

export const storyLikes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { storyId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 40;
    const skip = (page - 1) * limit;

    const story = await Story.findById(storyId);
    if (
      !story ||
      story.author._id.toString() !== req.currentuser?._id.toString() ||
      story.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000)
    )
      return next(new appError('story not found', 404));

    const blockIds = req.blockIds || new Set();

    const likes = await Like.find({ story: storyId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const filtered = likes.filter((e) => !blockIds.has(e.user.toString()));
    const userIds = filtered.map((e) => e.user.toString());
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

    const likesCount = await Like.countDocuments({ story: storyId });

    res.status(200).json({
      status: 'success',
      data: {
        page,
        limit,
        likesCount,
        users,
      },
    });
  },
);
