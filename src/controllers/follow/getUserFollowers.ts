import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const getUserFollowers = catchAsync(
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

    const followers = await Follow.find({
      following: req.targetUser?._id,
      follower: { $nin: ids },
      status: 'accepted',
    })
      .select('follower -_id')
      .populate('follower', 'username profilePhoto')
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      status: 'success',
      data: {
        page,
        limit,
        length: followers.length,
        followers,
      },
    });
  },
);
