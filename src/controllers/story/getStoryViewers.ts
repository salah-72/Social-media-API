import Block from '@/models/blockModel';
import Story from '@/models/storyModel';
import View from '@/models/viewModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import redisClient from '@/utils/redis';
import { Types } from 'mongoose';

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

    const userId = req.currentuser?._id.toString();

    let blockIds: Set<string>;
    try {
      const [iBlock, blockedByMe] = await Promise.all([
        redisClient.sMembers(`user:blocks:${userId}`),
        redisClient.sMembers(`user:blockedBy:${userId}`),
      ]);
      blockIds = new Set([...iBlock, ...blockedByMe]);
    } catch {
      const blocks = await Block.find({
        $or: [{ blocker: userId }, { blocked: userId }],
      });
      blockIds = new Set(
        blocks.map((e) =>
          e.blocker.toString() === userId
            ? e.blocked.toString()
            : e.blocker.toString(),
        ),
      );
    }

    const views = await View.find({ story: storyId })
      .sort({ at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const filtered = views.filter((e) => !blockIds.has(e.user.toString()));
    const userIds = filtered.map((e) => e.user.toString());

    // ------ TODO: CACH USERS ------------
    const viewsCount = await View.countDocuments({ story: storyId });

    res.status(200).json({
      status: 'success',
      data: {
        page,
        limit,
        viewsCount,
        viewers,
      },
    });
  },
);
