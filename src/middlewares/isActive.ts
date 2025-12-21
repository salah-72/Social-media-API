import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const isActive = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentuser?.active)
      return next(new appError('your account is deleted or banned', 404));

    next();
  },
);
