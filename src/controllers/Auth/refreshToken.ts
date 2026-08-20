import config from '@/config/config';
import {
  generateAccessToken,
  generateRefreshToken,
} from '@/functions/generateTokens';
import Token from '@/models/tokenModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';
import { Response, Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ICustomJwtPayload } from '@/functions/generateTokens';

const refreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken as string;

    if (!refreshToken) {
      return next(new appError('refresh token is required', 400));
    }

    const exist = await Token.exists({ token: refreshToken });
    if (!exist)
      return next(new appError('invalid token, please log in again', 401));

    const payload = jwt.verify(
      refreshToken,
      config.JWT_REFRESH_KEY,
    ) as ICustomJwtPayload;

    await Token.updateOne(
      { token: refreshToken },
      { revoked: true, revokedAt: new Date() },
    );

    const accessToken = generateAccessToken(payload._id);
    const newRefreshToken = generateRefreshToken(payload._id);

    await Token.create({
      token: newRefreshToken,
      userId: payload._id,
      deviceIp: req.ip,
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 20 * 24 * 60 * 60 * 1000,
    });

    sendResponse(res, 200, { tokens: { accessToken } });
  },
);

export default refreshToken;
