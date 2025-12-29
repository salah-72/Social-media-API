import { logger } from '@/lib/winston';
import Follow from '@/models/followModel';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const unfollow = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const follower = req.currentuser?._id;
    const following = req.params.id;

    const follow = await Follow.findOne({
      follower,
      following,
      status: 'accepted',
    });
    if (!follow)
      return next(new appError(`you are not following this user`, 400));

    // await Follow.deleteOne({ _id: follow._id });
    // await User.findByIdAndUpdate(follower, { $inc: { following: -1 } });
    // await User.findByIdAndUpdate(following, { $inc: { followers: -1 } });
    await Promise.all([
      Follow.deleteOne({ _id: follow._id }),
      User.findByIdAndUpdate(follower, { $inc: { following: -1 } }),
      User.findByIdAndUpdate(following, { $inc: { followers: -1 } }),
    ]);

    logger.warn(`${follower} stop following ${following}`);

    res.status(204).json({
      status: 'success',
    });
  },
);
