import Conversation from '@/models/conversationModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

export const promoteToAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { conversationId, targetId } = req.params;
    const userId = req.currentuser!._id.toString();

    const conversation = await Conversation.findById(conversationId);

    if (!conversation || !conversation.isGroup)
      return next(new appError('conversation not found', 404));

    const isRequesterAdmin = conversation.groupAdmins?.some(
      (p) => p.toString() === userId,
    );
    if (!isRequesterAdmin)
      return next(new appError('only a group admin can promote members', 403));

    const isMember = conversation.participants.some(
      (p) => p.toString() === targetId,
    );
    if (!isMember)
      return next(new appError('user is not a member of this group', 404));

    const isAlreadyAdmin = conversation.groupAdmins?.some(
      (p) => p.toString() === targetId,
    );
    if (isAlreadyAdmin)
      return next(new appError('user is already an admin', 400));

    conversation.groupAdmins = [
      ...(conversation.groupAdmins ?? []),
      new Types.ObjectId(targetId),
    ];

    await conversation.save();

    sendResponse(res, 200, { conversation });
  },
);
