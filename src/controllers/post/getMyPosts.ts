import Post from '@/models/postModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const getMyPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      author: req.currentuser?._id,
      status: 'published',
    })
      .select('-__v -status')
      .sort('-createdAt')
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
