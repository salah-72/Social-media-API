import { logger } from '@/lib/winston';
import Follow from '@/models/followModel';
import Notification from '@/models/notificationModel';
import { removeRealtimeNotification } from '@/socket';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import redisClient from '@/utils/redis';
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
    const notification = await Notification.findOneAndDelete({
      recipient: following,
      sender: follower,
      type: 'follow_request',
    });
    if (notification) {
      await removeRealtimeNotification(following, notification._id.toString());
      if (!notification.isRead) {
        const currentCount = await redisClient.get(
          `user:unread_notifications:${following}`,
        );
        if (currentCount && parseInt(currentCount) > 0) {
          await redisClient.decr(`user:unread_notifications:${following}`);
        }
      }
    }
    logger.warn(`${follower} canceled follow request ${following}`);

    res.status(204).send();
  },
);
