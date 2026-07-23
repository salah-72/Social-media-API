import Notification from '@/models/notificationModel';
import catchAsync from '@/utils/catchAsync';
import redisClient from '@/utils/redis';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response } from 'express';

export const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.currentuser?._id;

  const unreadCount = await redisClient.get(
    `user:unread_notifications:${userId}`,
  );

  if (!unreadCount || Number(unreadCount) === 0) {
    return sendResponse(res, 200, undefined, {
      message: 'notifications marked as read',
    });
  }

  await Promise.all([
    Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true },
    ),
    redisClient.set(`user:unread_notifications:${userId}`, 0),
  ]);

  sendResponse(res, 200, undefined, {
    message: 'notifications marked as read',
  });
});
