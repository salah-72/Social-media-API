import { Request, Response, NextFunction } from 'express';
import Conversation from '@/models/conversationModel';
import Message from '@/models/messageModel';
import catchAsync from '@/utils/catchAsync';
import appError from '@/utils/appError';
import { sendResponse } from '@/utils/sendResponse';
import { logger } from '@/lib/winston';
import { sendRealtimeReadReceipt } from '@/socket/index';

export const markConversationRead = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const conversationId = req.params.id;
    const userId = req.currentuser!._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return next(new appError('Conversation not found', 404));
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString(),
    );
    if (!isParticipant) {
      return next(new appError('You are not part of this conversation', 403));
    }

    const result = await Message.updateMany(
      { conversation: conversationId, sender: { $ne: userId }, readAt: null },
      { readAt: new Date() },
    );

    if (result.modifiedCount > 0) {
      const otherUserId = conversation.participants
        .find((p) => p.toString() !== userId.toString())!
        .toString();

      try {
        await sendRealtimeReadReceipt(otherUserId, {
          conversationId: conversation._id,
          readBy: userId,
        });
      } catch (err) {
        logger.warn('Failed to push realtime read receipt', { err });
      }
    }

    sendResponse(res, 200, undefined, {
      message: 'conversation marked as read',
    });
  },
);
