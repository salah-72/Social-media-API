import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOne({ email: req.currentuser?.email });
    if (!user) return next(new appError('your account is not found', 404));

    res.status(200).json({
      status: 'success',
      userInfo: user,
    });
  },
);
