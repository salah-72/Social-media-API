import Like from '@/models/likeModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import { sendResponse } from '@/utils/sendResponse';
import { fetchPaginatedUserList } from '@/utils/paginatedUserList';
import { assertOwnActiveStory } from '@/utils/Assertownactivestory';

export const storyLikes = catchAsync(async (req: Request, res: Response) => {
  const { storyId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 40;

  await assertOwnActiveStory(storyId, req.currentuser?._id);

  const blockIds = [...(req.blockIds ?? [])];

  const { items: users, total } = await fetchPaginatedUserList({
    model: Like,
    filter: { story: storyId, user: { $nin: blockIds } },
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
});
