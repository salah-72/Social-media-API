import Follow from '@/models/followModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const mutualFollowings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO: get my followings
    if (req.currentuser?._id.toString() === req.targetUser?._id.toString())
      return next(new appError('go to /myFollowings', 400));

    const followed = await Follow.exists({
      follower: req.currentuser?._id,
      following: req.targetUser?._id,
      status: 'accepted',
    });

    if (!req.targetUser?.public && !followed)
      return next(new appError('private account', 403));

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
