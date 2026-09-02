import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import Conversation from '../../models/conversationModel';
import Message from '../../models/messageModel';
import { getUsersFromCache } from '@/utils/getUsersFromCache';
import { sendResponse } from '@/utils/sendResponse';

export const getConversations = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.currentuser!._id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
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

    const otherUserIds = conversations.map((c) =>
      c.participants
        .find((p) => p.toString() !== userId.toString())!
        .toString(),
    );
    const conversationIds = conversations.map((c) => c._id);

    const [otherUsers, unreadCounts] = await Promise.all([
      getUsersFromCache(otherUserIds),
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

    const unreadMap = new Map(
      unreadCounts.map((u) => [u._id.toString(), u.count]),
    );

    const result = conversations.map((c, i) => ({
      _id: c._id,
      otherUser: otherUsers[i],
      lastMessage: c.lastMessage,
      lastMessageAt: c.lastMessageAt,
      lastMessageSender: c.lastMessageSender,
      unreadCount: unreadMap.get(c._id.toString()) || 0,
    }));

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
