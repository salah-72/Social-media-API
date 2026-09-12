import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import { uploadToCloudinary } from '@/utils/cloudinaryUpload';
import { generatePairKey } from '@/functions/generatePairKey';
import Conversation from '@/models/conversationModel';
import Message from '@/models/messageModel';
import { Types } from 'mongoose';
import { sendRealtimeMessage } from '@/socket/index';
import { logger } from '@/lib/winston';
import { sendResponse } from '@/utils/sendResponse';
import { createMessage } from '@/functions/createMessage';

export const sendMessage = catchAsync(
  async (req: Request, res: Response, next: Function) => {
    const recipientId = req.params.id;
    const senderId = req.currentuser!._id;
    const { content } = req.body as { content?: string };

    if (recipientId === senderId.toString()) {
      return next(new Error('You cannot send a message to yourself'));
    }

    if (!content && !req.file) {
      return next(new Error('A message must contain either text or an image'));
    }

    let image: { url: string; publicId: string } | undefined;
    if (req.file) {
      const { secure_url, public_id } = await uploadToCloudinary(
        req.file.buffer,
        'messages',
      );
      image = { url: secure_url, publicId: public_id };
    }

    const pairKey = generatePairKey(senderId, recipientId);

    let conversation = await Conversation.findOne({ pairKey });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [
          new Types.ObjectId(senderId),
          new Types.ObjectId(recipientId),
        ],
        pairKey,
      });
    }

    const message = await createMessage({
      conversation,
      senderId,
      content,
      image,
    });

    sendResponse(res, 201, {
      message,
      conversationId: conversation._id,
    });
  },
);
