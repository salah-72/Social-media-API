import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const getUserFollowings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const followed = await Follow.exists({
      follower: req.currentuser?._id,
      following: req.targetUser?._id,
      status: 'accepted',
    });

    if (
      !req.targetUser?.public &&
      !followed &&
      req.currentuser?._id.toString() !== req.targetUser?._id.toString()
    )
      return next(new appError('private account', 403));

    const blocks = await Block.find({
      $or: [
        { blocked: req.currentuser?._id },
        { blocker: req.currentuser?._id },
      ],
    });

    const ids = blocks.map((e) => {
      if (e.blocker.toString() === req.currentuser?._id.toString())
        return e.blocked;
      else return e.blocker;
    });

    const followings = await Follow.find({
      follower: req.targetUser?._id,
      following: { $nin: ids },
      status: 'accepted',
    })
      .select('following -_id')
      .populate('following', 'username profilePhoto');

    res.status(200).json({
      status: 'success',
      data: {
        length: followings.length,
        followings,
      },
    });
  },
);
