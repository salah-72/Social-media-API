import { Types } from 'mongoose';
import Notification, { INotification } from '@/models/notificationModel';
import { sendRealtimeNotification } from '@/socket';
import { getUsersFromCache } from './getUsersFromCache';

interface sendNotificationInput {
  recipient: Types.ObjectId | string;
  sender: Types.ObjectId | string;
  type: INotification['type'];
  post?: Types.ObjectId | string;
  comment?: Types.ObjectId | string;
  story?: Types.ObjectId | string;
}

export const sendNotification = async (input: sendNotificationInput) => {
  if (input.recipient.toString() === input.sender.toString()) return;

  const notification = await Notification.create(input);

  const [senderData] = await getUsersFromCache([input.sender.toString()]);

  await sendRealtimeNotification(input.recipient.toString(), {
    _id: notification._id,
    sender: senderData,
    type: input.type,
    post: input.post,
    comment: input.comment,
    story: input.story,
    createdAt: notification.createdAt,
  });

  return notification;
};
