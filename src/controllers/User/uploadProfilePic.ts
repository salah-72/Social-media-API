import { logger } from '@/lib/winston';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { uploadToCloudinary } from '@/utils/cloudinaryUpload';
import { Request, Response, NextFunction } from 'express';
import { invalidateUserCache } from '@/utils/getUsersFromCache';
import { sendResponse } from '@/utils/sendResponse';

export const uploadProfilePic = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next(new appError('photo not found', 404));

    const { secure_url } = await uploadToCloudinary(req.file.buffer, 'images');

    const user = await User.findByIdAndUpdate(
      req.currentuser?._id,
      {
        profilePhoto: secure_url,
      },
      { new: true },
    );

    if (!user) return next(new appError('user not found', 404));

    logger.info('user changed his profile photo', { id: req.currentuser?._id });

    await invalidateUserCache(user._id);

    sendResponse(res, 200, undefined, { message: 'photo updated' });
  },
);
