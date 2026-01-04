import Follow from '@/models/followModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const isFollower = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.currentuser?._id.toString() === req.targetUser?._id.toString())
      return next(new appError('go to /my', 400));

    const isFollower = await Follow.exists({
      follower: req.currentuser?._id,
      following: req.targetUser?._id,
      status: 'accepted',
    });

    if (
      !req.targetUser?.public &&
      !isFollower &&
      req.currentuser?._id.toString() !== req.targetUser?._id.toString()
    )
      return next(new appError('private account', 403));

    next();
  },
);
