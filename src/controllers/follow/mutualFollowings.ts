import Follow from '@/models/followModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const mutualFollowings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const followings = await Follow.find({
      follower: req.currentuser?._id,
      status: 'accepted',
    });

    const ids = followings.map((e) => {
      return e.following;
    });

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const mutualFollowings = await Follow.find({
      follower: req.targetUser?._id,
      following: { $in: ids },
      status: 'accepted',
    })
      .select('following -_id')
      .populate('following', 'username profilePhoto')
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      status: 'success',
      data: {
        page,
        limit,
        length: mutualFollowings.length,
        mutualFollowings,
      },
    });
  },
);
