import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import User from '@/models/userModel';
import { logger } from '@/lib/winston';

export const updatePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return next(new appError('required values are missed', 404));

    const user = await User.findOne({ email: req.currentuser?.email }).select(
      '+password',
    );

    if (!user) return next(new appError('your account is not found', 404));

    if (!(await bcrypt.compare(oldPassword, user?.password)))
      return next(new appError('password is wrong', 400));

    user.password = newPassword;

    await user.save();

    logger.info('user changed his password', { id: user._id });

    res.status(200).json({
      status: 'success',
      message: 'password changed successfully',
    });
  },
);
