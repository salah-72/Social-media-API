import { Request, Response, NextFunction } from 'express';
import User from '@/models/userModel';
import { canModerateUser } from '@/functions/role';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import Token from '@/models/tokenModel';
import { logger } from '@/lib/winston';
import { sendNotification } from '@/utils/sendNotification';
import { sendResponse } from '@/utils/sendResponse';

export const banUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { reason } = req.body;

    if (id === req.currentuser?._id.toString()) {
      return next(new appError('You cannot ban yourself', 400));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new appError('User not found', 404));
    }

    if (!canModerateUser(req.currentuser?.role, user.role)) {
      return next(
        new appError('You do not have permission to ban this user', 403),
      );
    }

    if (user.banned) {
      return next(new appError('This user is already banned', 400));
    }

    user.active = false;
    user.banned = true;
    user.bannedBy = req.currentuser!._id;
    user.bannedAt = new Date();
    if (reason) user.banReason = reason;
    await user.save();

    await Token.updateMany(
      { userId: user._id, revoked: false },
      { revoked: true, revokedAt: new Date() },
    );

    logger.info('User banned', {
      targetUser: user._id,
      bannedBy: req.currentuser?._id,
      reason,
    });

    try {
      await sendNotification({
        recipient: user._id,
        sender: req.currentuser!._id,
        type: 'account_banned',
      });
    } catch (err) {
      logger.error('failed to send account_banned notification', {
        targetUser: user._id,
        err,
      });
    }

    sendResponse(res, 200, undefined, { message: 'user banned' });
  },
);
