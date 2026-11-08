import Block from '@/models/blockModel';
import catchAsync from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response } from 'express';
import { fetchPaginatedUserList } from '@/utils/paginatedUserList';

export const blockList = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const { items: blockList, total } = await fetchPaginatedUserList({
    model: Block,
    filter: { blocker: req.currentuser?._id },
    userField: 'blocked',
    select: 'blocked -_id',
    page,
    limit,
    mapItem: (_doc, user) => user,
  });

  sendResponse(
    res,
    200,
    { blockList },
    { pagination: { page, limit, total }, results: blockList.length },
  );
});
