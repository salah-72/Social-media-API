import User from '@/models/userModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.currentuser?._id)
      .select(
        '-password -emailVerificationToken -passwordResetToken -passwordResetExpires -__v -emailVerified -active',
      )
      .lean();

    res.status(200).json({
      status: 'success',
      data: {
        userInfo: user,
      },
    });
  },
);
