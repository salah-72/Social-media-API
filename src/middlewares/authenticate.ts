import config from '@/config/config';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getAuthUser } from '@/utils/getUsersFromCache';
import { isTokenBlacklisted } from '@/utils/tokenBlacklist';
import { ICustomJwtPayload } from '@/functions/generateTokens';

export const authenticate = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer '))
      return next(new appError('Access denied, no token provided', 401));

    const token = auth.split(' ')[1];

    const isBlacklisted = await isTokenBlacklisted(token);

    if (isBlacklisted)
      return next(
        new appError('Token has been revoked. Please login again.', 401),
      );

    const payload = jwt.verify(
      token,
      config.JWT_ACCESS_KEY,
    ) as ICustomJwtPayload;

    const user = await getAuthUser(payload._id.toString());

    if (!user)
      return next(
        new appError('The user belonging to this token no longer exists', 401),
      );

    if (!user?.emailVerified)
      return next(
        new appError('Access denied, verify your email to get access', 401),
      );

    req.currentuser = user;
    next();
  },
);
