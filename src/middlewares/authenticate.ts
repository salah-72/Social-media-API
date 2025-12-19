import config from '@/config/config';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';

interface JwtRefreshPayload extends jwt.JwtPayload {
  userId: Types.ObjectId;
}

export const authenticate = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer '))
      return next(new appError('Access denied, no token provided', 401));

    const token = auth.split(' ')[1];

    const payload = jwt.verify(
      token,
      config.JWT_ACCESS_KEY,
    ) as JwtRefreshPayload;

    const user = await User.findById(payload._id);

    if (!user?.emailVerified)
      return next(
        new appError('Access denied, verify your email to get access', 401),
      );

    req.currentuser = user;
    next();
  },
);
