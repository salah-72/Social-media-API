import Like from '@/models/likeModel';
import catchAsync from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { fetchPaginatedUserList } from '@/utils/paginatedUserList';
import { assertCommentVisible } from '@/utils/assertcommentvisible';

export const commentLikes = catchAsync(async (req: Request, res: Response) => {
  const { postId, commentId } = req.params;
  const blockIds = [...(req.blockIds ?? [])];

  await assertCommentVisible(commentId, postId, blockIds);

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 40;

  const { items: users, total } = await fetchPaginatedUserList({
    model: Like,
    filter: {
      comment: new Types.ObjectId(commentId),
      user: { $nin: blockIds },
    },
    userField: 'user',
    select: '_id user type',
    sort: { createdAt: -1 },
    page,
    limit,
    mapItem: (like: any, user) => ({ ...like, user }),
  });

  sendResponse(
    res,
    200,
    { users },
    { pagination: { page, limit, total }, results: users.length },
  );
});
