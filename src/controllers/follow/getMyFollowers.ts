import Follow from '@/models/followModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import { getUsersFromCache } from '@/utils/getUsersFromCache';
import { sendResponse } from '@/utils/sendResponse';

export const getMyFollowers = catchAsync(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      Follow.find({
        following: req.currentuser?._id,
        status: 'accepted',
      })
        .select('follower -_id')
        .skip(skip)
        .limit(limit)
        .lean(),

      Follow.countDocuments({
        following: req.currentuser?._id,
        status: 'accepted',
      }),
    ]);

    const userIds = followers.map((e) => e.follower.toString());
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
