import Block from '@/models/blockModel';
import catchAsync from '@/utils/catchAsync';
import { getUsersFromCache } from '@/utils/getUsersFromCache';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response } from 'express';

export const blockList = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [blocks, total] = await Promise.all([
    Block.find({ blocker: req.currentuser?._id })
      .select('blocked -_id')
      .skip(skip)
      .limit(limit)
      .lean(),
    Block.countDocuments({ blocker: req.currentuser?._id }),
  ]);

  const userIds = blocks.map((b) => b.blocked.toString());
  const usersData = await getUsersFromCache(userIds);

  const blockList = usersData.filter(Boolean);

  sendResponse(
    res,
    200,
    { blockList },
    { pagination: { page, limit, total }, results: blockList.length },
  );
});
