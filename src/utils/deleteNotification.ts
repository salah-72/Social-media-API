import { Types } from 'mongoose';
import Notification, { INotification } from '@/models/notificationModel';
import { removeRealtimeNotification } from '@/socket';
import redisClient from './redis';

interface deleteNotificationInput {
  recipient: Types.ObjectId | string;
  sender: Types.ObjectId | string;
  type: INotification['type'];
  post?: Types.ObjectId | string;
  comment?: Types.ObjectId | string;
  story?: Types.ObjectId | string;
}

export const deleteNotification = async (input: deleteNotificationInput) => {
  const notification = await Notification.findOneAndDelete(input);
  if (!notification) return;

  await removeRealtimeNotification(
    input.recipient.toString(),
    notification._id.toString(),
  );

  if (!notification.isRead) {
    const count = await redisClient.get(
      `user:unread_notifications:${input.recipient}`,
    );

    if (count && Number(count) > 0) {
      await redisClient.decr(`user:unread_notifications:${input.recipient}`);
    }
  }

  return notification;
};
