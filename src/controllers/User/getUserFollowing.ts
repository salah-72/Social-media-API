import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const getUserFollowings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const followings = await Follow.find({
      follower: req.targetUser?._id,
      following: { $nin: ids },
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
