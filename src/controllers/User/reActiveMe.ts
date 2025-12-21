import { logger } from '@/lib/winston';
import User from '@/models/userModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const activeMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await User.findByIdAndUpdate(req.currentuser?._id, { active: true });

    logger.info('user active his account again', { id: req.currentuser?._id });

    res.status(200).json({
      status: 'success',
    });
  },
);
