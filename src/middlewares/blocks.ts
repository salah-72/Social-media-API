import Block from '@/models/blockModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const loadBlockList = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.currentuser?._id.toString();

    const blockList = await Block.find({
      $or: [
        {
          blocker: userId,
        },
        {
          blocked: userId,
        },
      ],
    });

    const blockIds = new Set(
      blockList.map((e) =>
        e.blocker.toString() === userId
          ? e.blocked.toString()
          : e.blocker.toString(),
      ),
    );

    req.blockIds = blockIds;
    next();
  },
);
