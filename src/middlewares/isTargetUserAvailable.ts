import Block from '@/models/blockModel';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const isTargetUserAvailable = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const targetUser = await User.findById(id).select(
      '-password -emailVerificationToken -passwordResetToken -passwordResetExpires -__v',
    );

    if (!targetUser || !targetUser.emailVerified || !targetUser.active)
      return next(new appError('user not found', 404));

    const blocked = await Block.exists({
      $or: [
        { blocker: id, blocked: req.currentuser?._id },
        { blocker: req.currentuser?._id, blocked: id },
      ],
    });

    if (blocked) return next(new appError('user not found', 404));

    req.targetUser = targetUser;
    next();
  },
);
