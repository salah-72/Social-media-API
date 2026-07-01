import Follow from '@/models/followModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import { sendResponse } from '@/utils/sendResponse';
import { getUsersFromCache } from '@/utils/getUsersFromCache';

export const getMyFollowings = catchAsync(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [followings, total] = await Promise.all([
      Follow.find({
        follower: req.currentuser?._id,
        status: 'accepted',
      })
        .select('following -_id')
        .skip(skip)
        .limit(limit)
        .lean(),

      Follow.countDocuments({
        follower: req.currentuser?._id,
        status: 'accepted',
      }),
    ]);

    const userIds = followings.map((e) => e.following.toString());
    const following = await getUsersFromCache(userIds);
    const followingsData = following
      .map((userData) => {
        if (!userData) return null;
        return { user: userData };
      })
      .filter(Boolean);

    sendResponse(
      res,
      200,
      { followingsData },
      { pagination: { page, limit, total }, results: followingsData.length },
    );
  },
);
