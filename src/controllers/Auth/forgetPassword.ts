import User, { IUser } from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { transporter } from '@/utils/nodemailer';
import { logger } from '@/lib/winston';
import config from '@/config/config';
import { sendResponse } from '@/utils/sendResponse';

type IForget = Pick<IUser, 'email' | 'username'>;

export const forgetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, username } = req.body as IForget;

    const genericMessage =
      'If an account with that email or username exists, a password reset link has been sent';

    let user = await User.findOne({ email });
    user = user || (await User.findOne({ username }));

    if (!user) {
      return sendResponse(res, 200, undefined, {
        message: genericMessage,
      });
    }
    if (!user.emailVerified)
      return next(new appError('please verify your account ', 401));

    const plainToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(plainToken)
      .digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const info = await transporter.sendMail({
      from: 'our social media app',
      to: user.email,
      subject: 'reset password',
      text: 'reset your password',
      html: `<h1>Password Resetting</h1>
          <p>Hello ${user.firstName}, Please follow this link to reset your password. </p><a href= '${config.BASE_URL}/api/v1/auth/reset/${plainToken}'> Click link </a>
          <p>Your password reset token valid for only 10 minutes</p>`,
    });
    logger.info('Message sent:', info.messageId);

    sendResponse(res, 200, undefined, {
      message: genericMessage,
    });
  },
);
