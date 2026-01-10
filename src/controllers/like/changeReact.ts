import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import Like from '@/models/likeModel';
import Post from '@/models/postModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const changeReact = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const type = req.body?.type;

    const like = await Like.findOne({
      user: req.currentuser!._id,
      post: postId,
    });
    if (!like || !type) return next(new appError('react not found', 404));

    like.type = type;
    await like.save();

    res.status(200).json({
      status: 'success',
      data: {
        like,
      },
    });
  },
);
