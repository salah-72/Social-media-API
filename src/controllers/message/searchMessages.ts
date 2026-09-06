import { Request, Response } from 'express';
import catchAsync from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';
import Conversation from '@/models/conversationModel';
import Message from '@/models/messageModel';
import { getUsersFromCache } from '@/utils/getUsersFromCache';

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const searchMessages = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.currentuser!._id;
    const { q } = req.query as { q: string };
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const myConversations = await Conversation.find({ participants: userId })
      .select('_id')
      .lean();
    const myConversationIds = myConversations.map((c) => c._id);

    if (!myConversationIds.length)
      return sendResponse(res, 200, { messages: [] }, { results: 0 });

    const filter = {
      conversation: { $in: myConversationIds },
      content: { $regex: escapeRegex(q), $options: 'i' },
    };

    const [messages, total] = await Promise.all([
      Message.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments(filter),
    ]);

    if (!messages.length)
      return sendResponse(res, 200, { messages: [] }, { results: 0 });

    const senderIds = [...new Set(messages.map((m) => m.sender.toString()))];
    const senders = await getUsersFromCache(senderIds);
    const senderMap = new Map(senderIds.map((id, i) => [id, senders[i]]));

    const result = messages.map((m) => ({
      _id: m._id,
      conversation: m.conversation,
      sender: senderMap.get(m.sender.toString()),
      content: m.content,
      createdAt: m.createdAt,
    }));

    sendResponse(
      res,
      200,
      { messages: result },
      { results: result.length, pagination: { page, limit, total } },
    );
  },
);
