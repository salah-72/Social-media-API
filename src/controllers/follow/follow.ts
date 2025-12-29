import { logger } from '@/lib/winston';
import Follow from '@/models/followModel';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const follow = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const follower = req.currentuser?._id;
    const following = req.params.id;

    const followingUser = await User.findById(following);
    if (!followingUser) return next(new appError('user not found', 404));

    const exist = await Follow.exists({ follower, following });
    if (exist) return next(new appError('you alreqdy follows this user', 400));

    if (follower?.toString() === following)
      return next(new appError('you cannot follow yourself', 400));

    let follow;
    if (followingUser.public) {
      follow = await Follow.create({ follower, following, status: 'accepted' });
      await User.findByIdAndUpdate(follower, { $inc: { following: 1 } });
      await User.findByIdAndUpdate(following, { $inc: { followers: 1 } });
      logger.info(`${follower} start following ${following}`);
    } else {
      follow = await Follow.create({ follower, following, status: 'pending' });
      logger.info(`${follower} requested to follow ${following}`);
    }

    res.status(201).json({
      status: 'success',
      follow,
    });
  },
);
