import Follow from '@/models/followModel';
import Post from '@/models/postModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
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

    if (!req.targetUser?.public && !followed) {
      const {
        username,
        firstName,
        lastName,
        profilePhoto,
        coverPhoto,
        followers,
        following,
      } = req.targetUser!;
      res.status(200).json({
        status: 'success',
        data: {
          username,
          firstName,
          lastName,
          profilePhoto,
          coverPhoto,
          followersCount: followers,
          followingCount: following,
        },
      });
      return;
    }

    const can = [];
    if (followed) can.push('followers');
    if (req.targetUser?.public) can.push('public');

    const posts = await Post.find({
      author: req.targetUser?._id,
      whoCanSee: { $in: can },
      status: 'published',
    }).select('-_id');

    res.status(200).json({
      status: 'success',
      data: {
        userInfo: req.targetUser,
        postsCount: posts!.length,
        posts,
      },
    });
  },
);
