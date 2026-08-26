import { logger } from '@/lib/winston';
import User from '@/models/userModel';
import catchAsync from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';
import appError from '@/utils/appError';
import { Request, Response, NextFunction } from 'express';
import { invalidateUserCache } from '@/utils/getUsersFromCache';

export const activeMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.currentuser?.banned)
      return next(
        new appError(
          'your account has been banned - contact support if you believe this is a mistake',
          403,
        ),
      );
    await User.updateOne({ _id: req.currentuser?._id }, { active: true });
    if (req.currentuser?._id) await invalidateUserCache(req.currentuser._id);

    logger.info('user active his account again', { id: req.currentuser?._id });

    sendResponse(res, 200, undefined, { message: 'activation done' });
  },
);
