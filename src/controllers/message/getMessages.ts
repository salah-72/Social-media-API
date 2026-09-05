import { Request, Response, NextFunction } from 'express';
import Conversation from '@/models/conversationModel';
import Message from '@/models/messageModel';
import catchAsync from '@/utils/catchAsync';
import appError from '@/utils/appError';
import { sendResponse } from '@/utils/sendResponse';

export const getMessages = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const conversationId = req.params.id;
    const userId = req.currentuser!._id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return next(new appError('Conversation not found', 404));
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString(),
    );
    if (!isParticipant)
      return next(new appError('you are not part of this conversation', 403));

    const [messages, total] = await Promise.all([
      Message.find({ conversation: conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments({ conversation: conversationId }),
    ]);

    sendResponse(
      res,
      200,
      { messages: messages },
      { pagination: { page, limit, total }, results: messages.length },
    );
  },
);
