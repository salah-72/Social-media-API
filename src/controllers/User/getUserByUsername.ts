import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import Post from '@/models/postModel';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
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

    if (!targetUser.public && !followed) {
      res.status(200).json({
        status: 'success',
        data: {
          username: targetUser.username,
          firstName: targetUser.firstName,
          lastName: targetUser.lastName,
          profilePhoto: targetUser.profilePhoto,
          coverPhoto: targetUser.coverPhoto,
          followersCount: targetUser.followers,
          followingCount: targetUser.following,
        },
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        userInfo: targetUser,
      },
    });
  },
);
