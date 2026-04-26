import { logger } from '@/lib/winston';
import Block from '@/models/blockModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import redisClient from '@/utils/redis';

export const unblock = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const blocker = req.currentuser?._id;
    const blocked = req.params.id;

    if (blocker?.toString() === blocked)
      return next(new appError('you cannot unblock yourself', 400));

    const block = await Block.findOneAndDelete({ blocker, blocked });
    if (!block) return next(new appError('you didnot block this user', 400));
    logger.info(`${blocker} unblocked ${blocked}`);

    try {
      const pipeline = redisClient.multi();
      pipeline.sRem(`user:blocks:${blocker}`, blocked.toString());
      pipeline.sRem(`user:blockedBy:${blocked}`, blocker!.toString());
      await pipeline.exec();
    } catch (err) {
      logger.warn(
        `Redis sync failed after delete block ${blocker} → ${blocked}`,
      );
    }

    res.status(204).send();
  },
);
