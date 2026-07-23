import { logger } from '@/lib/winston';
import Follow from '@/models/followModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { deleteNotification } from '@/utils/deleteNotification';
import { Request, Response, NextFunction } from 'express';

export const reject = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const following = req.currentuser?._id;
    const follower = req.params.id;

    const exist = await Follow.exists({
      follower,
      following,
      status: 'pending',
    });
    if (!exist) return next(new appError('request not found', 404));

    await Promise.all([
      Follow.deleteOne({ follower, following }),

      deleteNotification({
        recipient: following!,
        sender: follower!,
        type: 'follow_request',
      }),
    ]);

    logger.info(`you reject ${follower}'s follow request`);

    res.status(204).send();
  },
);
