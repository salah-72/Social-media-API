import View from '@/models/viewModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import { sendResponse } from '@/utils/sendResponse';
import { fetchPaginatedUserList } from '@/utils/paginatedUserList';
import { assertOwnActiveStory } from '@/utils/Assertownactivestory';

export const getViewers = catchAsync(async (req: Request, res: Response) => {
  const { storyId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 40;

  await assertOwnActiveStory(storyId, req.currentuser?._id);

  const blockIds = [...(req.blockIds ?? [])];

  const { items: viewers, total } = await fetchPaginatedUserList({
    model: View,
    filter: { story: storyId, user: { $nin: blockIds } },
    userField: 'user',
    sort: { at: -1 },
    page,
    limit,
    warnLabel: 'getViewers',
    mapItem: (view: any, user) => ({ at: view.at, user }),
  });

  sendResponse(
    res,
    200,
    { viewers },
    { pagination: { page, limit, total }, results: viewers.length },
  );
});
