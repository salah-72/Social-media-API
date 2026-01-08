import Like from '@/models/likeModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const postsLikedByMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const posts = await Like.find({ user: req.currentuser?._id })
      .sort('-createdAt')
      .select('post')
      .populate('post', 'content images.url')
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
