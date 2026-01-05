import Follow from '@/models/followModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const getMyFollowings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const followings = await Follow.find({
      follower: req.currentuser?._id,
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
        length: followings.length,
        followings,
      },
    });
  },
);
