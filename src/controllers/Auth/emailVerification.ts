import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import User from '@/models/userModel';
import { logger } from '@/lib/winston';

export const emailVerification = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.params.token;

    const encryptedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({ emailVerificationToken: encryptedToken });
    if (!user) {
      return next(
        new appError('your token is not accurate, please try again', 400),
      );
    }

    user.emailVerificationToken = 'undefined';
    user.emailVerified = true;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'email verified successfully',
    });

    logger.info('user verified his account', { Email: user.email });
  },
);
