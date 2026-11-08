import Like from '@/models/likeModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '@/utils/sendResponse';
import { fetchPaginatedUserList } from '@/utils/paginatedUserList';

const ALLOWED_REACTION_TYPES = [
  'like',
  'love',
  'care',
  'sad',
  'angry',
  'haha',
  'wow',
];

export const reaction = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId, type } = req.params;

    if (!ALLOWED_REACTION_TYPES.includes(type))
      return next(new appError('invalid reaction type', 400));

    const blockIds = [...(req.blockIds ?? [])];

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 40;

    const { items: users, total } = await fetchPaginatedUserList({
      model: Like,
      filter: { post: postId, type, user: { $nin: blockIds } },
      userField: 'user',
      sort: { createdAt: -1 },
      page,
      limit,
      mapItem: (like: any, user) => ({
        user,
        type: like.type,
        createdAt: like.createdAt,
        updatedAt: like.updatedAt,
      }),
    });

    sendResponse(
      res,
      200,
      { users },
      { pagination: { page, limit, total }, results: users.length },
    );
  },
);
