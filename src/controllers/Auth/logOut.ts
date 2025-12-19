import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/lib/winston';
import Token from '@/models/tokenModel';
import config from '@/config/config';
import appError from '@/utils/appError';

export const logOut = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken as string;

    if (!refreshToken) return next(new appError('you are not logging in', 400));

    await Token.deleteOne({ token: refreshToken });

    logger.info('User refresh token deleted successfully', {
      email: req.currentuser?.email,
      refreshToken,
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    logger.info('user logged out successfully', {
      email: req.currentuser?.email,
    });

    res.status(200).json({
      success: 'success',
      message: 'logout successfully',
    });
  },
);
