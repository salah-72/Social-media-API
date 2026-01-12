import Comment from '@/models/commentModel';
import Post from '@/models/postModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const createComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const { content } = req.body;

    const comment = await Comment.create({
      user: req.currentuser?._id,
      post: postId,
      parentComment: null,
      content,
    });

    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    res.status(201).json({
      status: 'success',
      data: {
        comment,
      },
    });
  },
);
