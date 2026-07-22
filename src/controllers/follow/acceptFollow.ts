import { logger } from '@/lib/winston';
import Follow from '@/models/followModel';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { deleteNotification } from '@/utils/deleteNotification';
import { sendNotification } from '@/utils/sendNotification';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const accept = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const following = req.currentuser!._id;
    const follower = req.targetUser!._id;

    const exist = await Follow.exists({
      follower,
      following,
      status: 'pending',
    });
    if (!exist) return next(new appError('request not found', 404));

    await Promise.all([
      Follow.updateOne({ follower, following }, { status: 'accepted' }),
      sendNotification({
        recipient: follower,
        sender: following,
        type: 'follow_accept',
      }),
      deleteNotification({
        recipient: following,
        sender: follower,
        type: 'follow_request',
      }),
      User.updateOne({ _id: follower }, { $inc: { following: 1 } }),
      User.updateOne({ _id: following }, { $inc: { followers: 1 } }),
    ]);

    logger.info(`you accept ${follower}'s follow request`);

    sendResponse(res, 200, undefined, { message: 'follow request accepted' });
  },
);
