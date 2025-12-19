import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import User from '@/models/userModel';
import { logger } from '@/lib/winston';
import config from '@/config/config';
import {
  generateRefreshToken,
  generateAccessToken,
} from '@/functions/generateTokens';
import Token from '@/models/tokenModel';

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

    user.emailVerificationToken = undefined;
    user.emailVerified = true;

    await user.save({ validateBeforeSave: false });

    const refreshToken = generateRefreshToken(user._id);
    const accessToken = generateAccessToken(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    await Token.create({
      token: refreshToken,
      userId: user._id,
    });

    logger.info('Refresh token created for user', {
      userId: user._id,
      token: refreshToken,
    });

    res.status(200).json({
      status: 'success',
      message: 'email verified successfully',
      accessToken,
    });

    logger.info('user verified his account', { Email: user.email });
  },
);
