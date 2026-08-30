import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/lib/winston';
import Token from '@/models/tokenModel';
import config from '@/config/config';
import { sendResponse } from '@/utils/sendResponse';
import { blacklistToken } from '@/utils/tokenBlacklist';

export const logOut = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken as string;
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!refreshToken) {
      return res
        .status(200)
        .json({ status: 'success', message: 'Already logged out' });
    }

    await Token.updateOne(
      { token: refreshToken },
      { revoked: true, revokedAt: new Date() },
    );

    if (accessToken) await blacklistToken(accessToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    logger.info('user logged out successfully', {
      email: req.currentuser?.email,
    });

    sendResponse(res, 200, undefined, { message: 'logged out successfully' });
  },
);

export const logoutAll = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.currentuser?._id;
    const accessToken = req.headers.authorization?.split(' ')[1];
    await Token.updateMany(
      { userId, revoked: false },
      { revoked: true, revokedAt: new Date() },
    );

    if (accessToken) await blacklistToken(accessToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    logger.info('user logged out from all devices successfully', {
      email: req.currentuser?.email,
    });

    sendResponse(res, 200, undefined, {
      message: 'logged out successfully from all devices',
    });
  },
);
