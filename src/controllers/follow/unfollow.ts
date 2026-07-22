import { logger } from '@/lib/winston';
import Follow from '@/models/followModel';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { deleteNotification } from '@/utils/deleteNotification';
import { Request, Response, NextFunction } from 'express';

export const unfollow = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const follower = req.currentuser?._id;
    const following = req.targetUser?._id;

    const follow = await Follow.findOne({
      follower,
      following,
      status: 'accepted',
    });
    if (!follow)
      return next(new appError(`you are not following this user`, 400));

    await Promise.all([
      Follow.deleteOne({ _id: follow._id }),
      User.updateOne({ _id: follower }, { $inc: { following: -1 } }),
      User.updateOne({ _id: following }, { $inc: { followers: -1 } }),
      deleteNotification({
        recipient: following!,
        sender: follower!,
        type: 'follow',
      }),
    ]);

    logger.warn(`${follower} stop following ${following}`);

    res.status(204).send();
  },
);
