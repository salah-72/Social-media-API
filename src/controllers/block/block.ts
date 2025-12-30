import { logger } from '@/lib/winston';
import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const block = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const blocker = req.currentuser?._id;
    const blocked = req.params.id;

    if (blocker?.toString() === blocked)
      return next(new appError('you cannot block yourself', 400));

    const exist = await Block.exists({ blocker, blocked });
    if (exist) return next(new appError('you already blocked that user', 400));

    const follow = await Follow.findOne({
      follower: blocker,
      following: blocked,
      status: 'accepted',
    });
    if (follow) {
      await Promise.all([
        Follow.deleteOne({ _id: follow._id }),
        User.findByIdAndUpdate(blocker, { $inc: { following: -1 } }),
        User.findByIdAndUpdate(blocked, { $inc: { followers: -1 } }),
      ]);
    }

    const followed = await Follow.findOne({
      follower: blocked,
      following: blocker,
      status: 'accepted',
    });
    if (followed) {
      await Promise.all([
        Follow.deleteOne({ _id: followed._id }),
        User.findByIdAndUpdate(blocker, { $inc: { followers: -1 } }),
        User.findByIdAndUpdate(blocked, { $inc: { following: -1 } }),
      ]);
    }

    const followReq = await Follow.findOne({
      follower: blocker,
      following: blocked,
      status: 'pending',
    });
    if (followReq) await Follow.deleteOne({ _id: followReq._id });

    const followedReq = await Follow.findOne({
      follower: blocked,
      following: blocker,
      status: 'pending',
    });
    if (followedReq) await Follow.deleteOne({ _id: followedReq._id });

    const block = await Block.create({ blocker, blocked });

    logger.info(`${blocker} blocked ${blocked}`);

    res.status(201).json({
      status: 'success',
      block,
    });
  },
);
