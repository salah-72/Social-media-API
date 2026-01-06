import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const suggestedFollowings = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const myId = req.currentuser?._id;
    const myFollowings = await Follow.find({
      follower: myId,
      status: 'accepted',
    }).select('following -_id');

    const myFollowingsIds = myFollowings.map((e) => {
      return e.following;
    });

    const blocks = await Block.find({
      $or: [{ blocked: myId }, { blocker: myId }],
    });

    const BlocksIds = blocks.map((e) => {
      if (e.blocker.toString() === myId?.toString()) return e.blocked;
      else return e.blocker;
    });

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const suggestedFollowings = await Follow.find({
      follower: { $in: myFollowingsIds },
      status: 'accepted',
      following: { $nin: [...BlocksIds, ...myFollowingsIds, myId!] },
    })
      .select('following -_id')
      .populate('following', 'username profilePhoto')
      .limit(limit)
      .skip(skip)
      .lean();

    const unique = Array.from(
      new Map(
        suggestedFollowings.map((e) => [e.following._id.toString(), e]),
      ).values(),
    );

    res.status(200).json({
      status: 'success',
      data: {
        page,
        limit,
        length: unique.length,
        unique,
      },
    });
  },
);
