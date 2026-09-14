import Conversation from '@/models/conversationModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const demoteAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { conversationId, targetId } = req.params;
    const userId = req.currentuser!._id.toString();

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isGroup)
      return next(new appError('group not found', 404));

    const isRequesterAdmin = conversation.groupAdmins?.some(
      (a) => a.toString() === userId,
    );
    if (!isRequesterAdmin)
      return next(
        new appError('only a group admin can demote another admin', 403),
      );

    const isTargetAdmin = conversation.groupAdmins?.some(
      (a) => a.toString() === targetId,
    );
    if (!isTargetAdmin)
      return next(new appError('user is not an admin of this group', 400));

    if (conversation.groupAdmins!.length === 1)
      return next(
        new appError(
          'cannot demote the last admin - promote someone else first',
          400,
        ),
      );

    conversation.groupAdmins = conversation.groupAdmins!.filter(
      (a) => a.toString() !== targetId,
    );
    await conversation.save();

    sendResponse(res, 200, { conversation });
  },
);
