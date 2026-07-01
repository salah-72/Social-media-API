import Like from '@/models/likeModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import { getUsersFromCache } from '@/utils/getUsersFromCache';
import { sendResponse } from '@/utils/sendResponse';

export const postLikes = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 40;
  const skip = (page - 1) * limit;

  const blockIds = req.blockIds;

  const [likes, total] = await Promise.all([
    Like.find({ post: postId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Like.countDocuments({ post: postId }),
  ]);

  const filtered = likes.filter((like) => !blockIds?.has(like.user.toString()));
  const userIds = filtered.map((like) => like.user.toString());
  const usersData = await getUsersFromCache(userIds);

  const users = filtered
    .map((like, idx) => {
      if (!usersData[idx]) return null;
      return {
        user: usersData[idx],
        type: like.type,
        createdAt: like.createdAt,
        updatedAt: like.updatedAt,
      };
    })
    .filter(Boolean);

  sendResponse(
    res,
    200,
    { users },
    { pagination: { page, limit, total }, results: users.length },
  );
});
