import { logger } from '@/lib/winston';
import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import redisClient from '@/utils/redis';
import User from '@/models/userModel';

export const getUserFollowers = catchAsync(
  async (req: Request, res: Response) => {
    const blockIds = req.blockIds || new Set();

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const followers = await Follow.find({
      following: req.targetUser?._id,
      status: 'accepted',
    })
      .select('follower -_id')
      .skip(skip)
      .limit(limit)
      .lean();

    const filtered = followers.filter(
      (e) => !blockIds.has(e.follower.toString()),
    );
    const userIds = filtered.map((e) => e.follower.toString());
    const cacheKeys = userIds.map((id) => `user:${id}`);

    let cachedUsers: any[] = [];
    try {
      cachedUsers =
        cacheKeys.length > 0 ? await redisClient.mGet(cacheKeys) : [];
    } catch {
      logger.warn('Redis mGet failed in storyLikes');
    }

    const missedIds = userIds.filter((id, idx) => !cachedUsers[idx]);
    const missedUsers =
      missedIds.length > 0
        ? await User.find({
            _id: { $in: missedIds },
            active: true,
          })
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
      } catch (error) {
        logger.error('Error caching users:', error);
      }
    }

    const mongooseMap = new Map(missedUsers.map((u) => [u._id.toString(), u]));
    const followersData = userIds
      .map((id, idx) => {
        const userData = cachedUsers[idx]
          ? JSON.parse(cachedUsers[idx]!)
          : mongooseMap.get(id);
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
