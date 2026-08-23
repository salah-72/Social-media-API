import { logger } from '@/lib/winston';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const updateUserRole = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { role } = req.body as { role: 'user' | 'admin' | 'superadmin' };

    if (id === req.currentuser?._id.toString())
      return next(
        new appError(
          'you cannot change your own role - ask another superadmin to do it',
          400,
        ),
      );

    const user = await User.findById(id);
    if (!user) return next(new appError('user not found', 404));

    if (user.role === role)
      return next(new appError(`user already has the '${role}' role`, 400));

    user.role = role;
    await user.save();

    logger.info('user role changed', {
      targetUser: user._id,
      newRole: role,
      changedBy: req.currentuser?._id,
    });

    sendResponse(res, 200, {
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  },
);
