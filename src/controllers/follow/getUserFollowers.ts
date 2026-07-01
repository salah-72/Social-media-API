import Follow from '@/models/followModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import { sendResponse } from '@/utils/sendResponse';
import { getUsersFromCache } from '@/utils/getUsersFromCache';

export const getUserFollowers = catchAsync(
  async (req: Request, res: Response) => {
    const blockIds = req.blockIds || new Set();

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      Follow.find({
        following: req.targetUser?._id,
        status: 'accepted',
      })
        .select('follower -_id')
        .skip(skip)
        .limit(limit)
        .lean(),

      Follow.countDocuments({
        following: req.targetUser?._id,
        follower: { $nin: Array.from(blockIds) },
        status: 'accepted',
      }),
    ]);

    const filtered = followers.filter(
      (e) => !blockIds.has(e.follower.toString()),
    );
    const userIds = filtered.map((e) => e.follower.toString());
    const followerss = await getUsersFromCache(userIds);

    const followersData = followerss
      .map((userData) => {
        if (!userData) return null;
        return { user: userData };
      })
      .filter(Boolean);

    sendResponse(
      res,
      200,
      { followersData },
      { pagination: { page, limit, total }, results: followersData.length },
    );
  },
);
