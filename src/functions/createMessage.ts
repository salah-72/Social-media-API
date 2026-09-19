import { Types, HydratedDocument } from 'mongoose';
import { IConversation } from '@/models/conversationModel';
import Message from '@/models/messageModel';
import { logger } from '@/lib/winston';
import { sendRealtimeMessage } from '@/socket';
interface CreateMessageParams {
  conversation: HydratedDocument<IConversation>;
  senderId: Types.ObjectId | string;
  content?: string;
  image?: { url: string; publicId: string };
  video?: { url: string; publicId: string; duration?: number };
}

export const createMessage = async ({
  conversation,
  senderId,
  content,
  image,
  video,
}: CreateMessageParams) => {
  const message = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    content,
    image,
    video,
  });

  conversation.lastMessage = content ?? (video ? '🎥 Video' : '📷 Photo');
  conversation.lastMessageAt = message.createdAt;
  conversation.lastMessageSender = new Types.ObjectId(senderId);
  await conversation.save();

  const recipientIds = conversation.participants
    .map((p) => p.toString())
    .filter((id) => id !== senderId.toString());

  const payload = {
    conversationId: conversation._id,
    message: {
      _id: message._id,
      sender: senderId,
      content: message.content,
      image: message.image,
      video: message.video,
      createdAt: message.createdAt,
    },
  };

  await Promise.all(
    recipientIds.map((recipientId) =>
      sendRealtimeMessage(recipientId, payload).catch((err) => {
        logger.warn('Failed to push realtime message', { recipientId, err });
      }),
    ),
  );

  return message;
};
