import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import { uploadToCloudinary } from '@/utils/cloudinaryUpload';
import { generatePairKey } from '@/functions/generatePairKey';
import Conversation from '@/models/conversationModel';
import { Types } from 'mongoose';
import { sendResponse } from '@/utils/sendResponse';
import { createMessage } from '@/functions/createMessage';
import appError from '@/utils/appError';

export const sendMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const recipientId = req.params.id;
    const senderId = req.currentuser!._id;
    const { content } = req.body as { content?: string };

    if (recipientId === senderId.toString()) {
      return next(new Error('You cannot send a message to yourself'));
    }

    if (!content && !req.file) {
      return next(
        new appError('a message needs text, an image, or a video', 400),
      );
    }

    let image: { url: string; publicId: string } | undefined;
    let video: { url: string; publicId: string; duration?: number } | undefined;

    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video');
      const result = await uploadToCloudinary(
        req.file.buffer,
        'messages',
        isVideo ? 'video' : 'image',
      );

      if (isVideo) {
        video = {
          url: result.secure_url,
          publicId: result.public_id,
          duration: result.duration,
        };
      } else {
        image = { url: result.secure_url, publicId: result.public_id };
      }
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
      video,
    });

    sendResponse(res, 201, {
      message,
      conversationId: conversation._id,
    });
  },
);
