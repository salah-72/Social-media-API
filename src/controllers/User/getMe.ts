import Post from '@/models/postModel';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.currentuser?._id)
      .select(
        '-password -emailVerificationToken -passwordResetToken -passwordResetExpires -__v -emailVerified -active',
      )
      .lean();

    const posts = await Post.find({
      author: req.targetUser?._id,
      status: 'published',
    })
      .select('-_id')
      .lean();

    res.status(200).json({
      status: 'success',
      data: {
        userInfo: user,
        postsCount: posts!.length,
        posts,
      },
    });
  },
);
