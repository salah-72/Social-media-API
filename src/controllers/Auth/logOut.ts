import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/lib/winston';
import Token from '@/models/tokenModel';
import BlackList from '@/models/blackListTokensModel';
import config from '@/config/config';
import jwt from 'jsonwebtoken';

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

    if (accessToken) {
      const decoded = jwt.decode(accessToken) as { exp: number };
      const expiryDate = decoded.exp
        ? new Date(decoded.exp * 1000)
        : new Date(Date.now() + 15 * 60 * 1000);
      await BlackList.create({
        token: accessToken,
        expiredAt: expiryDate,
      });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    logger.info('user logged out successfully', {
      email: req.currentuser?.email,
    });

    res.status(200).json({
      status: 'success',
      message: 'logout successfully',
    });
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

    if (accessToken) {
      const decoded = jwt.decode(accessToken) as { exp: number };
      const expiryDate = decoded.exp
        ? new Date(decoded.exp * 1000)
        : new Date(Date.now() + 15 * 60 * 1000);
      await BlackList.create({
        token: accessToken,
        expiredAt: expiryDate,
      });
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    logger.info('user logged out from all devices successfully', {
      email: req.currentuser?.email,
    });
    res.status(200).json({
      status: 'success',
      message: 'logged out from all devices successfully',
    });
  },
);
