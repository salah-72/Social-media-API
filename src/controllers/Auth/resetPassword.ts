import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '@/lib/winston';
import { sendResponse } from '@/utils/sendResponse';

export const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.params.token;

    if (!token) return next(new appError('token not exist', 400));

    const encryptedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: encryptedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return next(new appError('invalid token', 400));

    if (req.body.password !== req.body.confirmPassword) {
      return next(new appError('passwords do not match', 400));
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.info('user reset his password successfully', { Email: user.email });

    sendResponse(res, 200, undefined, {
      message: 'password is reset successfully',
    });
  },
);
