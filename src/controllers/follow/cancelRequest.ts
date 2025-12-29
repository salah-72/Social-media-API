import { logger } from '@/lib/winston';
import Follow from '@/models/followModel';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const cancelReq = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const follower = req.currentuser?._id;
    const following = req.params.id;

    const follow = await Follow.findOne({
      follower,
      following,
      status: 'pending',
    });
    if (!follow)
      return next(
        new appError(`you did't send follow request to this user`, 400),
      );

    await Follow.deleteOne({ _id: follow._id });

    logger.warn(`${follower} canceled follow request ${following}`);

    res.status(204).json({
      status: 'success',
    });
  },
);
