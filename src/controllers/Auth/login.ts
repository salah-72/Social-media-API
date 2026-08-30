import catchAsync from '@/utils/catchAsync';
import e, { Request, Response, NextFunction } from 'express';
import User from '@/models/userModel';
import { IUser } from '@/models/userModel';
import appError from '@/utils/appError';
import bcrypt from 'bcrypt';
import {
  generateRefreshToken,
  generateAccessToken,
} from '@/functions/generateTokens';
import config from '@/config/config';
import Token from '@/models/tokenModel';
import redisClient from '@/utils/redis';
import { logger } from '@/lib/winston';
import { sendResponse } from '@/utils/sendResponse';

type ILogin = Pick<IUser, 'email' | 'username' | 'password'>;

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, username, password } = req.body as ILogin;

    let user;
    if (email) user = await User.findOne({ email }).select('+password');
    else if (username)
      user = await User.findOne({ username }).select('+password');

    if (!user) return next(new appError('invalid email or username', 401));

    if (!user.emailVerified)
      return next(new appError('please verify your account ', 401));

    if (!(await bcrypt.compare(password, user.password)))
      return next(new appError('incorrect password', 400));

    const refreshToken = generateRefreshToken(user._id);
    const accessToken = generateAccessToken(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 20 * 24 * 60 * 60 * 1000,
    });

    // await Token.updateOne(
    //   { userId: user._id },
    //   { token: refreshToken },
    //   { upsert: true },
    // );
    await Token.create({
      token: refreshToken,
      userId: user._id,
      deviceIp: req.ip,
      userAgent: req.headers['user-agent'] || 'unknown',
    });

    logger.info('Refresh token created for user', {
      userId: user._id,
      token: refreshToken,
    });

    try {
      await redisClient.set(
        `user:${user._id}`,
        JSON.stringify({
          _id: user._id,
          username: user.username,
          profilePhoto: user.profilePhoto,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          emailVerified: user.emailVerified,
          active: user.active,
          banned: user.banned,
          role: user.role,
          public: user.public,
        }),
        { EX: 24 * 60 * 60 },
      );
    } catch {
      logger.warn('Failed to cache user data in Redis during login');
    }

    sendResponse(res, 200, {
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePhoto: user.profilePhoto,
      },
      tokens: {
        accessToken,
      },
    });

    logger.info('user logged in', {
      Email: user.email,
      username: user.username,
    });
  },
);
