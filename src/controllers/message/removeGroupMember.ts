import Conversation from '@/models/conversationModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const removeGroupMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.currentuser?._id;
    const conversationId = req.params.id;
    const { memberId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isGroup)
      return next(new appError('group not found', 404));

    const isSelfLeaving = userId?.toString() === memberId.toString();

    const isAdmin = conversation.groupAdmins?.some(
      (a) => a.toString() === userId?.toString(),
    );

    if (!isSelfLeaving && !isAdmin)
      return next(
        new appError('only a group admin can remove other members', 403),
      );

    const isMember = conversation.participants.some(
      (p) => p.toString() === memberId?.toString(),
    );
    if (!isMember)
      return next(new appError('user is not a member of this group', 404));

    conversation.participants = conversation.participants.filter(
      (p) => p.toString() !== memberId.toString(),
    );
    conversation.groupAdmins = conversation.groupAdmins?.filter(
      (a) => a.toString() !== memberId.toString(),
    );

    if (
      conversation.groupAdmins?.length === 0 &&
      conversation.participants.length > 0
    ) {
      conversation.groupAdmins = [conversation.participants[0]];
    }

    await conversation.save();

    res.status(204).send();
  },
);
