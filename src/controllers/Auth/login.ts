import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
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
import { logger } from '@/lib/winston';

type ILogin = Pick<IUser, 'email' | 'username' | 'password'>;

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log(req.body);
    const { email, username, password } = req.body as ILogin;
    if (!(email || username) || !password)
      return next(
        new appError('please enter your email or username and password', 400),
      );

    let user;
    if (email) user = await User.findOne({ email }).select('+password');
    else if (username)
      user = await User.findOne({ username }).select('+password');

    if (!user) return next(new appError('invalid email or username', 400));

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
    });

    await Token.findOneAndUpdate(
      { userId: user._id },
      {
        token: refreshToken,
        userId: user._id,
      },
    );
    logger.info('Refresh token created for user', {
      userId: user._id,
      token: refreshToken,
    });

    res.status(200).json({
      status: 'success',
      data: user,
      accessToken,
    });

    logger.info('user logged in', {
      Email: user.email,
      username: user.username,
    });
  },
);
