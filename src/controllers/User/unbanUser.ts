import { logger } from '@/lib/winston';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';
import { sendNotification } from '@/utils/sendNotification';
import { canModerateUser } from '@/functions/role';
import { Request, Response, NextFunction } from 'express';

export const unbanUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const target = await User.findById(id);
    if (!target) return next(new appError('user not found', 404));

    if (!canModerateUser(req.currentuser?.role, target.role))
      return next(
        new appError('you do not have permission to unban this user', 403),
      );

    if (!target.banned)
      return next(new appError('this user is not banned', 400));

    target.active = true;
    target.banned = false;
    target.bannedBy = undefined;
    target.bannedAt = undefined;
    target.banReason = undefined;
    await target.save();

    logger.info('user unbanned', {
      targetUser: target._id,
      unbannedBy: req.currentuser?._id,
    });

    try {
      await sendNotification({
        recipient: target._id,
        sender: req.currentuser!._id,
        type: 'account_unbanned',
      });
    } catch (err) {
      logger.error('failed to send account_unbanned notification', {
        targetUser: target._id,
        err,
      });
    }

    sendResponse(res, 200, undefined, { message: 'user unbanned' });
  },
);
