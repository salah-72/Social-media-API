import Block from '@/models/blockModel';
import Comment from '@/models/commentModel';
import Post from '@/models/postModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const createReply = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId, commentId } = req.params;
    const { content } = req.body;

    const parentComment = await Comment.findById(commentId).select('user post');
    if (!parentComment || parentComment.post.toString() !== postId.toString())
      return next(new appError('comment not exist', 404));

    const block = await Block.exists({
      $or: [
        { blocker: req.currentuser?._id, blocked: parentComment.user },
        { blocked: req.currentuser?._id, blocker: parentComment.user },
      ],
    });

    if (block) return next(new appError('comment not exist', 404));

    const comment = await Comment.create({
      user: req.currentuser?._id,
      post: postId,
      parentComment: commentId,
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
