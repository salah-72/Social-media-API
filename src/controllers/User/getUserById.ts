import Follow from '@/models/followModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const getUserById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.currentuser?._id.toString() === req.targetUser?._id.toString())
      return next(new appError('please go to /getMe', 400));

    const followed = await Follow.exists({
      follower: req.currentuser?._id,
      following: req.targetUser?._id,
      status: 'accepted',
    });

    const user = req.targetUser;
    const info = {
      username: user?.username,
      firstName: user?.firstName,
      lastName: user?.lastName,
      profilePhoto: user?.profilePhoto,
      coverPhoto: user?.coverPhoto,
      followers: user?.followers,
      following: user?.following,
      public: user?.public,
    };

    if (!req.targetUser?.public && !followed) {
      sendResponse(res, 200, {
        userInfo: info,
      });
      return;
    }

    sendResponse(res, 200, {
      userInfo: {
        ...info,
        email: user?.email,
        education: user?.education,
        experience: user?.experience,
      },
    });
  },
);
