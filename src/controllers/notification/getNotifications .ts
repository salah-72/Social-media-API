import Notification from '@/models/notificationModel';
import catchAsync from '@/utils/catchAsync';
import { getUsersFromCache } from '@/utils/getUsersFromCache';
import redisClient from '@/utils/redis';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const getNotifications = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const userId = req.currentuser?._id;

    const [notifications, total, unread] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipient: userId }),
      redisClient.get(`user:unread_notifications:${userId}`),
    ]);

    const senderIds = notifications.map((n) => n.sender.toString());
    const sendersData = await getUsersFromCache(senderIds);

    const result = notifications.map((n, i) => ({
      _id: n._id,
      type: n.type,
      isRead: n.isRead,
      createdAt: n.createdAt,
      post: n.post,
      comment: n.comment,
      story: n.story,
      sender: sendersData[i],
    }));

    sendResponse(
      res,
      200,
      { notifications: result, unreadCount: Number(unread || 0) },
      { pagination: { page, limit, total } },
    );
  },
);
