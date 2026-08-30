import User from '@/models/userModel';
import catchAsync from '@/utils/catchAsync';
import appError from '@/utils/appError';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.currentuser?._id);
    if (!user) return next(new appError('user not found', 404));

    sendResponse(res, 200, {
      userInfo: {
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePhoto: user.profilePhoto,
        coverPhoto: user.coverPhoto,
        email: user.email,
        followers: user.followers,
        following: user.following,
        public: user.public,
        education: user.education,
        experience: user.experience,
        hometown: user.hometown,
        currentCity: user.currentCity,
        about: user.about,
        gender: user.gender,
        birthday: user.birthday,
        socialLinks: user.socialLinks,
      },
    });
  },
);
