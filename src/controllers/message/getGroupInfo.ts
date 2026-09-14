import Conversation from '@/models/conversationModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { getUsersFromCache } from '@/utils/getUsersFromCache';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const getGroupInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const conversationId = req.params.id;
    const userId = req.currentuser!._id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation || !conversation.isGroup)
      return next(new appError('group not found', 404));

    const isMember = conversation.participants.some(
      (p) => p.toString() === userId.toString(),
    );

    if (!isMember) return next(new appError('only a group member can ', 403));

    const memberIds = conversation.participants.map((p) => p.toString());
    const adminIds = new Set(
      (conversation.groupAdmins ?? []).map((a) => a.toString()),
    );

    const members = await getUsersFromCache(memberIds);
    const memberList = memberIds.map((id, i) => ({
      _id: id,
      isAdmin: adminIds.has(id),
      ...(members[i] ?? { username: null, unavailable: true }),
    }));

    sendResponse(res, 200, {
      conversation: {
        _id: conversation._id,
        groupName: conversation.groupName,
        groupPhoto: conversation.groupPhoto,
        createdBy: conversation.createdBy,
        createdAt: conversation.createdAt,
        members: memberList,
      },
    });
  },
);
