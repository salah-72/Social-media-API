import config from '@/config/config';
import { generateAccessToken } from '@/functions/generateTokens';
import Token from '@/models/tokenModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Response, Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

interface JwtRefreshPayload extends jwt.JwtPayload {
  userId: Types.ObjectId;
}

const refreshAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken as string;

    const exist = await Token.exists({ token: refreshToken });
    if (!exist)
      return next(new appError('invalid token, please log in again', 401));

    const payload = jwt.verify(
      refreshToken,
      config.JWT_REFRESH_KEY,
    ) as JwtRefreshPayload;

    const accessToken = generateAccessToken(payload.userId);

    res.status(200).json({
      accessToken,
    });
  },
);

export default refreshAccessToken;
