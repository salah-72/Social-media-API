import Follow from '@/models/followModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import redisClient from '@/utils/redis';
import { logger } from '@/lib/winston';
import User from '@/models/userModel';

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
    const cacheKeys = userIds.map((id) => `user:${id}`);
    let cachedUsers: any[] = [];
    try {
      cachedUsers = cacheKeys.length ? await redisClient.mGet(cacheKeys) : [];
    } catch (error) {
      logger.error('Error fetching cached users:', error);
    }

    const missedIds = userIds.filter((_, i) => !cachedUsers[i]);

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
