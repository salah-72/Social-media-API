import { logger } from '@/lib/winston';
import User from '@/models/userModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';

export const deleteMe = catchAsync(async (req: Request, res: Response) => {
  await User.updateOne({ _id: req.currentuser?._id }, { active: false });

  logger.info('user disactive his account', { id: req.currentuser?._id });

  res.status(204).send();
});
