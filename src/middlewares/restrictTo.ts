import { Request, Response, NextFunction } from 'express';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { IUser } from '@/models/userModel';

export const restrictTo = (...roles: IUser['role'][]) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentuser || !roles.includes(req.currentuser.role)) {
      return next(
        new appError('you do not have permission to perform this action', 403),
      );
    }
    next();
  });
