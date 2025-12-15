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
import appError from '@/utils/appError';
import crypto from 'crypto';
import { transporter } from '@/utils/nodemailer';

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
    const { email, password, firstName, lastName } = req.body as userData;

    const username = genUsername(firstName);

    const newUser = await User.create({
      email,
      password,
      firstName,
      lastName,
      username,
    });

    if (!newUser)
      return next(new appError('something went wrong while signning up', 400));
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

    const plainToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(plainToken)
      .digest('hex');

    await User.findByIdAndUpdate(newUser._id, {
      emailVerificationToken: hashedToken,
    });

    const info = await transporter.sendMail({
      from: 'salah',
      to: newUser.email,
      subject: 'email verification',
      text: 'verify your email',
      html: `<h1>Email verification </h1>
          <p>Hello ${newUser.firstName}, Please follow this link to verify your account. </p><a href= 'http://localhost:3000/api/v1/auth/verify/${plainToken}'> Click link </a>
          <p>If you did not verfiy your account you won't be able to use the website</p>`,
    });
    logger.info('Message sent:', info.messageId);
  },
);
