import Conversation from '@/models/conversationModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { uploadToCloudinary } from '@/utils/cloudinaryUpload';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const updateGroupInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.currentuser?._id;
    const conversationId = req.params.id;
    const { name } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isGroup)
      return next(new appError('conversation not exist', 404));

    const isAdmin = conversation.groupAdmins?.some(
      (a) => userId?.toString() === a.toString(),
    );

    if (!isAdmin)
      return next(new appError('Only admins can edit group info', 403));

    if (!name && !req.file)
      return next(
        new appError('provide a new name and/or photo to update', 400),
      );

    if (req.file) {
      const { secure_url, public_id } = await uploadToCloudinary(
        req.file.buffer,
        'img',
      );
      conversation.groupPhoto = { url: secure_url, publicId: public_id };
    }

    if (name) conversation.groupName = name;

    await conversation.save();

    sendResponse(res, 200, { conversation });
  },
);
