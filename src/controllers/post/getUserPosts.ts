import Follow from '@/models/followModel';
import Post from '@/models/postModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const getUserPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    const isFollower = await Follow.exists({
      follower: req.currentuser?._id,
      following: req.targetUser?._id,
      status: 'accepted',
    });

    const can = [];
    if (isFollower) can.push('followers');
    if (req.targetUser?.public) can.push('public');

    const posts = await Post.find({
      author: req.targetUser?._id,
      whoCanSee: { $in: can },
      status: 'published',
    })
      .select('-__v -status')
      .sort('-publishedAt')
      .populate('author', 'username profilePhoto')
      .limit(limit)
      .skip(skip)
      .lean();

    res.status(200).json({
      status: 'success',
      data: {
        page,
        limit,
        length: posts.length,
        posts,
      },
    });
  },
);
