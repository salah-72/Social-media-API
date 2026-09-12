import { createMessage } from '@/functions/createMessage';
import Conversation from '@/models/conversationModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { uploadToCloudinary } from '@/utils/cloudinaryUpload';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const sendGroupMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const conversationId = req.params.id;
    const senderId = req.currentuser!._id;
    const { content } = req.body as { content?: string };

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isGroup)
      return next(new appError('group not found', 404));

    const isMember = conversation.participants.some(
      (p) => p.toString() === senderId.toString(),
    );
    if (!isMember)
      return next(new appError('you are not a member of this group', 403));

    if (!content && !req.file)
      return next(new appError('a message needs either text or an image', 400));

    let image: { url: string; publicId: string } | undefined;
    if (req.file) {
      const { secure_url, public_id } = await uploadToCloudinary(
        req.file.buffer,
        'messages',
      );
      image = { url: secure_url, publicId: public_id };
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
