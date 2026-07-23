import Notification from '@/models/notificationModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import redisClient from '@/utils/redis';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const markOneAsRead = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.currentuser?._id;
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      recipient: userId,
    });

    if (!notification) {
      return next(new appError('notification not found', 404));
    }

    if (!notification.isRead) {
      notification.isRead = true;
      await notification.save();

      const unreadKey = `user:unread_notifications:${userId}`;
      const current = await redisClient.get(unreadKey);

      console.log(current);
      if (current && Number(current) > 0) {
        await redisClient.decr(unreadKey);
      }
    }

    sendResponse(res, 200, undefined, {
      message: 'notification marked as read',
    });
  },
);
