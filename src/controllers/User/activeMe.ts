import { logger } from '@/lib/winston';
import User from '@/models/userModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';

export const activeMe = catchAsync(async (req: Request, res: Response) => {
  await User.updateOne({ _id: req.currentuser?._id }, { active: true });

  logger.info('user active his account again', { id: req.currentuser?._id });

  res.status(200).json({
    status: 'success',
  });
});
