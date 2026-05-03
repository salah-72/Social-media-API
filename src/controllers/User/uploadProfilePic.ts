import { logger } from '@/lib/winston';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { uploadToCloudinary } from '@/utils/cloudinaryUpload';
import { Request, Response, NextFunction } from 'express';
import redisClient from '@/utils/redis';

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

    logger.info('user changed his profile photo', { id: req.currentuser?._id });

    try {
      await redisClient.set(
        `user:${user!._id}`,
        JSON.stringify({
          username: user!.username,
          profilePhoto: user!.profilePhoto,
          firstName: user!.firstName,
          lastName: user!.lastName,
        }),
        { EX: 24 * 60 * 60 },
      );
    } catch {
      logger.warn('Redis set failed in uploadProfilePic for user');
    }

    res.status(200).json({
      status: 'success',
      user,
    });
  },
);
