import Block from '@/models/blockModel';
import Story from '@/models/storyModel';
import View from '@/models/viewModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import redisClient from '@/utils/redis';
import { logger } from '@/lib/winston';
import User from '@/models/userModel';
import { getUsersFromCache } from '@/utils/getUsersFromCache';
import { sendResponse } from '@/utils/sendResponse';

export const getViewers = catchAsync(
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

    const [views, total] = await Promise.all([
      View.find({ story: storyId })
        .sort({ at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      View.countDocuments({ story: storyId }),
    ]);

    const filtered = views.filter((e) => !blockIds.has(e.user.toString()));
    const userIds = filtered.map((e) => e.user.toString());
    const usersData = await getUsersFromCache(userIds);

    const viewers = filtered
      .map((v, idx) => {
        if (!usersData[idx]) {
          logger.warn(`User data missing in getViewers`);
          return null;
        }
        return { at: v.at, user: usersData[idx] };
      })
      .filter(Boolean);

    sendResponse(
      res,
      200,
      { viewers },
      { pagination: { page, limit, total }, results: viewers.length },
    );
  },
);
