import Block from '@/models/blockModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';

export const blockList = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const blockList = await Block.find({ blocker: req.currentuser?._id })
    .select('blocked -_id')
    .populate('blocked', 'username profilePhoto -_id')
    .skip(skip)
    .limit(limit)
    .lean();

  const length = await Block.countDocuments({
    blocker: req.currentuser?._id,
  });
  res.status(200).json({
    status: 'success',
    data: {
      page,
      limit,
      length,
      blockList,
    },
  });
});
