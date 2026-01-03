import Follow from '@/models/followModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const mutualFollowers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const followers = await Follow.find({
      following: req.currentuser?._id,
      status: 'accepted',
    });

    const ids = followers.map((e) => {
      return e.follower;
    });

    const mutualFollowers = await Follow.find({
      following: req.targetUser?._id,
      follower: { $in: ids },
      status: 'accepted',
    })
      .select('follower -_id')
      .populate('follower', 'username profilePhoto');

    res.status(200).json({
      status: 'success',
      data: {
        length: mutualFollowers.length,
        mutualFollowers,
      },
    });
  },
);
