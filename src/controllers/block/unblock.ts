import { logger } from '@/lib/winston';
import Block from '@/models/blockModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const unblock = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const blocker = req.currentuser?._id;
    const blocked = req.params.id;

    if (blocker?.toString() === blocked)
      return next(new appError('you cannot unblock yourself', 400));

    const block = await Block.findOneAndDelete({ blocker, blocked });
    if (!block) return next(new appError('you didnot block this user', 400));

    logger.info(`${blocker} unblocked ${blocked}`);

    res.status(204).json({
      status: 'success',
    });
  },
);
