import Block from '@/models/blockModel';
import Conversation from '@/models/conversationModel';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const addGroupMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.currentuser!._id;
    const conversationId = req.params.id;
    const { memberId } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isGroup)
      return next(new appError('group not found', 404));

    const isAdmin = conversation.groupAdmins?.some(
      (a) => a.toString() === adminId.toString(),
    );
    if (!isAdmin)
      return next(new appError('only a group admin can add members', 403));

    const alreadyMember = conversation.participants.some(
      (p) => p.toString() === memberId,
    );
    if (alreadyMember)
      return next(new appError('user is already a member', 400));

    const member = await User.findOne({
      _id: memberId,
      active: true,
      emailVerified: true,
    }).select('_id');

    if (!member)
      return next(new appError('user not found, inactive, or unverified', 404));

    const isBlocked = await Block.exists({
      $or: [
        { blocker: adminId, blocked: memberId },
        { blocker: memberId, blocked: adminId },
      ],
    });

    if (isBlocked)
      return next(new appError('cannot add this member due to a block', 403));

    conversation.participants.push(member._id);
    await conversation.save();

    sendResponse(res, 200, { conversation });
  },
);
