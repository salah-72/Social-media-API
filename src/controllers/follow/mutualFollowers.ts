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

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const mutualFollowers = await Follow.find({
      following: req.targetUser?._id,
      follower: { $in: ids },
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
        length: mutualFollowers.length,
        mutualFollowers,
      },
    });
  },
);
