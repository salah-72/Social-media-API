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

    const mutualFollowings = await Follow.find({
      follower: req.targetUser?._id,
      following: { $in: ids },
      status: 'accepted',
    })
      .select('following -_id')
      .populate('following', 'username profilePhoto');

    res.status(200).json({
      status: 'success',
      data: {
        length: mutualFollowings.length,
        mutualFollowings,
      },
    });
  },
);
