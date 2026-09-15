import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import Conversation from '../../models/conversationModel';
import Message from '../../models/messageModel';
import { getUsersFromCache } from '@/utils/getUsersFromCache';
import { sendResponse } from '@/utils/sendResponse';
import { getOnlineStatus } from '@/utils/presence';

export const getConversations = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.currentuser!._id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      Conversation.find({ participants: userId })
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Conversation.countDocuments({ participants: userId }),
    ]);

    if (!conversations.length)
      return sendResponse(res, 200, { conversations: [] });

    const conversationIds = conversations.map((c) => c._id);
    const oneOnOne = conversations.filter((c) => !c.isGroup);

    const otherUserIds = oneOnOne.map((c) =>
      c.participants
        .find((p) => p.toString() !== userId.toString())!
        .toString(),
    );

    const [otherUsers, onlineStatuses, unreadCounts] = await Promise.all([
      getUsersFromCache(otherUserIds),
      getOnlineStatus(otherUserIds),
      Message.aggregate([
        {
          $match: {
            conversation: { $in: conversationIds },
            sender: { $ne: userId },
            readAt: null,
          },
        },
        {
          $group: {
            _id: '$conversation',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const otherUserMap = new Map(
      oneOnOne.map((c, i) => [c._id.toString(), otherUsers[i]]),
    );
    const unreadMap = new Map(
      unreadCounts.map((u) => [u._id.toString(), u.count]),
    );

    const result = conversations.map((c, i) => {
      const base = {
        _id: c._id,
        isGroup: c.isGroup,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
        lastMessageSender: c.lastMessageSender,
        unreadCount: unreadMap.get(c._id.toString()) ?? 0,
      };

      if (c.isGroup) {
        return {
          ...base,
          groupName: c.groupName,
          groupPhoto: c.groupPhoto,
          participantCount: c.participants.length,
        };
      }

      const otherUserId = c.participants
        .find((p) => p.toString() !== userId.toString())!
        .toString();

      return {
        ...base,
        otherUser: otherUserMap.get(c._id.toString()),
        isOnline: onlineStatuses.get(otherUserId) ?? false
      };
    });

    sendResponse(
      res,
      200,
      { conversations: result },
      {
        pagination: { page, limit, total },
        results: conversations.length,
      },
    );
  },
);
