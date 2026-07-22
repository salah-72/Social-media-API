import { logger } from '@/lib/winston';
import Follow from '@/models/followModel';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { sendNotification } from '@/utils/sendNotification';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const follow = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const follower = req.currentuser!._id;
    const following = req.targetUser!._id;

    const followingUser = req.targetUser;

    if (follower?.toString() === following?.toString())
      return next(new appError('you cannot follow yourself', 400));

    const exist = await Follow.exists({ follower, following });
    if (exist) return next(new appError('you already follows this user', 400));

    if (followingUser!.public) {
      await Promise.all([
        Follow.create({ follower, following, status: 'accepted' }),
        User.updateOne({ _id: follower }, { $inc: { following: 1 } }),
        User.updateOne({ _id: following }, { $inc: { followers: 1 } }),
        sendNotification({
          recipient: following,
          sender: follower,
          type: 'follow',
        }),
      ]);

      logger.info(`${follower} start following ${following}`);
      sendResponse(res, 201, undefined, { message: 'followed successfully' });
    } else {
      await Promise.all([
        Follow.create({ follower, following, status: 'pending' }),
        sendNotification({
          recipient: following,
          sender: follower,
          type: 'follow_request',
        }),
      ]);
      logger.info(`${follower} requested to follow ${following}`);
      sendResponse(res, 201, undefined, { message: 'follow request sent' });
    }
  },
);
