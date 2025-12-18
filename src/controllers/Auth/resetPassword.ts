import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '@/lib/winston';

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.params.token;

    const encryptedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    if (!token) return next(new appError('token not exist', 400));

    const user = await User.findOne({
      passwordResetToken: encryptedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return next(new appError('invalid token', 400));

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.info('user reset his password successfully', { Email: user.email });

    res.status(200).json({
      status: 'success',
      message: 'password is reset successfully',
    });
  },
);
