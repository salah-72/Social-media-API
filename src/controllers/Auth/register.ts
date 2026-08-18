import catchAsync from '@/utils/catchAsync';
import { genUsername } from '@/functions/generate_username';
import { Request, NextFunction, Response } from 'express';
import type { IUser } from '@/models/userModel';
import User from '@/models/userModel';
import { logger } from '@/lib/winston';
import appError from '@/utils/appError';
import crypto from 'crypto';
import { transporter } from '@/utils/nodemailer';
import config from '@/config/config';
import { sendResponse } from '@/utils/sendResponse';

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

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(new appError('this email is signed before', 409));
    }

    const username = genUsername(firstName);

    const plainToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(plainToken)
      .digest('hex');

    const newUser = await User.create({
      email,
      password,
      firstName,
      lastName,
      username,
      emailVerificationToken: hashedToken,
    });

    if (!newUser)
      return next(new appError('something went wrong while signning up', 400));

    const info = await transporter.sendMail({
      from: 'salah',
      to: newUser.email,
      subject: 'email verification',
      text: 'verify your email',
      html: `<h1>Email verification </h1>
          <p>Hello ${newUser.firstName}, Please follow this link to verify your account. </p><a href= '${config.BASE_URL}/api/v1/auth/verify/${plainToken}'> Click link </a>
          <p>If you did not verfiy your account you won't be able to use the website</p>`,
    });
    logger.info('Message sent:', info.messageId);

    logger.info('new user created successfully', {
      Email: newUser.email,
      username: newUser.username,
    });

    sendResponse(res, 201, {
      user: {
        _id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        emailVerified: newUser.emailVerified,
      },
    });
  },
);
