import Block from '@/models/blockModel';
import Story from '@/models/storyModel';
import View from '@/models/viewModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import redisClient from '@/utils/redis';
import { logger } from '@/lib/winston';
import User from '@/models/userModel';

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
    const cacheKeys = userIds.map((id) => `user:${id}`);

    let cachedUsers: any[] = [];
    try {
      cachedUsers =
        cacheKeys.length > 0 ? await redisClient.mGet(cacheKeys) : [];
    } catch {
      logger.warn('Redis mGet failed in getViewers');
    }

    const missedIds = userIds.filter((_, idx) => !cachedUsers[idx]);
    const missedUsers =
      missedIds.length > 0
        ? await User.find({ _id: { $in: missedIds }, active: true })
            .select('username profilePhoto firstName lastName')
            .lean()
        : [];

    if (missedUsers.length > 0) {
      try {
        const pipeline = redisClient.multi();
        missedUsers.forEach((u) =>
          pipeline.set(
            `user:${u._id.toString()}`,
            JSON.stringify({
              username: u.username,
              profilePhoto: u.profilePhoto,
              firstName: u.firstName,
              lastName: u.lastName,
            }),
            { EX: 24 * 60 * 60 },
          ),
        );
        await pipeline.exec();
      } catch {
        logger.warn('Redis multi set failed in getViewers');
      }
    }

    const mongooseMap = new Map(missedUsers.map((u) => [u._id.toString(), u]));
    const viewers = filtered
      .map((v, idx) => {
        const userId = userIds[idx];
        const userData = cachedUsers[idx]
          ? JSON.parse(cachedUsers[idx]!)
          : mongooseMap.get(userId);
        if (!userData) {
          logger.warn(`User data missing for userId ${userId} in getViewers`);
          return null;
        }
        return { at: v.at, user: userData };
      })
      .filter(Boolean);

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
