import { logger } from '@/lib/winston';
import Follow from '@/models/followModel';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const accept = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const following = req.currentuser?._id;
    const follower = req.params.id;

    const exist = await Follow.exists({
      follower,
      following,
      status: 'pending',
    });
    if (!exist) return next(new appError('request not found', 404));

    const follow = await Follow.findOneAndUpdate(
      { follower, following },
      { status: 'accepted' },
      { new: true },
    );

    await User.findByIdAndUpdate(follower, { $inc: { following: 1 } });
    await User.findByIdAndUpdate(following, { $inc: { followers: 1 } });

    logger.info(`you accept ${follower}'s follow request`);

    res.status(200).json({
      status: 'success',
      follow,
    });
  },
);
