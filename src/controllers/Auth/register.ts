import catchAsync from '@/utils/catchAsync';
import { genUsername } from '@/functions/generate_username';
import { Request, NextFunction, Response } from 'express';
import type { IUser } from '@/models/userModel';
import User from '@/models/userModel';
import { logger } from '@/lib/winston';
import config from '@/config/config';
import {
  generateRefreshToken,
  generateAccessToken,
} from '@/functions/generateTokens';
import Token from '@/models/tokenModel';

type userData = Pick<
  IUser,
  | 'email'
  | 'coverPhoto'
  | 'password'
  | 'profilePhoto'
  | 'firstName'
  | 'lastName'
>;
export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password, coverPhoto, profilePhoto, firstName, lastName } =
      req.body as userData;

    const username = genUsername(firstName);

    const newUser = await User.create({
      email,
      password,
      coverPhoto,
      profilePhoto,
      firstName,
      lastName,
      username,
    });

    const refreshToken = generateRefreshToken(newUser._id);
    const accessToken = generateAccessToken(newUser._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    await Token.create({
      token: refreshToken,
      userId: newUser._id,
    });
    logger.info('Refresh token created for user', {
      userId: newUser._id,
      token: refreshToken,
    });

    res.status(201).json({
      status: 'success',
      data: newUser,
      accessToken,
    });

    logger.info('new user created successfully', {
      Email: newUser.email,
      username: newUser.username,
    });
  },
);
