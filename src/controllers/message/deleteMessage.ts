import { Request, Response, NextFunction } from 'express';
import Message from '@/models/messageModel';
import Conversation from '@/models/conversationModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { deleteRealtimeMessage } from '@/socket';
import { logger } from '@/lib/winston';

export const deleteMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const messageId = req.params.id;
    const userId = req.currentuser!._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return next(new appError('Message not found', 404));
    }

    if (message.sender.toString() !== userId.toString()) {
      return next(
        new appError('You are not authorized to delete this message', 403),
      );
    }

    const conversation = await Conversation.findById(message.conversation);
    if (!conversation) {
      return next(new appError('Conversation not found', 404));
    }

    await message.deleteOne();

    if (conversation.lastMessageAt?.getTime() === message.createdAt.getTime()) {
      conversation.lastMessage = 'Message deleted';
      await conversation.save();
    }

    const recipientId = conversation.participants.find(
      (p) => p.toString() !== userId.toString(),
    );
    if (recipientId) {
      try {
        await deleteRealtimeMessage(
          recipientId.toString(),
          message._id.toString(),
          conversation._id.toString(),
        );
      } catch (err) {
        logger.error('Failed to send realtime message deletion:', err);
      }
    }

    res.status(204).send();
  },
);
