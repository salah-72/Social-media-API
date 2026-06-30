import User from '@/models/userModel';
import catchAsync from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response } from 'express';

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.currentuser;

  sendResponse(res, 200, {
    userInfo: {
      username: user?.username,
      firstName: user?.firstName,
      lastName: user?.lastName,
      profilePhoto: user?.profilePhoto,
      coverPhoto: user?.coverPhoto,
      email: user?.email,
      followers: user?.followers,
      following: user?.following,
      public: user?.public,
      education: user?.education,
      experience: user?.experience,
    },
  });
});
