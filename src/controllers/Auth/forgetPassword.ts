import User, { IUser } from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { transporter } from '@/utils/nodemailer';
import { logger } from '@/lib/winston';

type IForget = Pick<IUser, 'email' | 'username'>;
export const forgetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, username } = req.body as IForget;
    if (!username && !email)
      return next(new appError('please enter your email or username', 400));

    let user = await User.findOne({ email });
    user = user || (await User.findOne({ username }));

    if (!user)
      return next(new appError('entered email or password not correct', 400));

    if (!user.emailVerified)
      return next(new appError('please verify your account ', 401));

    const plainToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await crypto
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
          <p>Hello ${user.firstName}, Please follow this link to reset your password. </p><a href= 'http://localhost:3000/api/v1/auth/reset/${plainToken}'> Click link </a>
          <p>Your password reset token valid for only 10 minutes</p>`,
    });
    logger.info('Message sent:', info.messageId);

    res.status(200).json({
      status: 'success',
      message: 'password reset token sent successfully',
    });
  },
);
