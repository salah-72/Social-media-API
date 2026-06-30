import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const getUserByUsername = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.params;

    const targetUser = await User.findOne({ username }).select(
      '-password -emailVerificationToken -passwordResetToken -passwordResetExpires -__v',
    );

    if (!targetUser || !targetUser.emailVerified || !targetUser.active)
      return next(new appError('user not found', 404));

    const blocked = await Block.exists({
      $or: [
        { blocker: targetUser._id, blocked: req.currentuser?._id },
        { blocker: req.currentuser?._id, blocked: targetUser._id },
      ],
    });

    if (blocked) return next(new appError('user not found', 404));

    if (req.currentuser?._id.toString() === targetUser._id.toString())
      return next(new appError('please go to /getMe', 400));

    const followed = await Follow.exists({
      follower: req.currentuser?._id,
      following: targetUser._id,
      status: 'accepted',
    });

    const info = {};

    if (!req.targetUser?.public && !followed) {
      sendResponse(res, 200, {
        userInfo: {
          username: targetUser?.username,
          firstName: targetUser?.firstName,
          lastName: targetUser?.lastName,
          profilePhoto: targetUser?.profilePhoto,
          coverPhoto: targetUser?.coverPhoto,
          followers: targetUser?.followers,
          following: targetUser?.following,
          public: targetUser?.public,
        },
      });
      return;
    }

    sendResponse(res, 200, {
      userInfo: targetUser,
    });
  },
);
