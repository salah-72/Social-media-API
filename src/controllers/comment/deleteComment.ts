import Comment from '@/models/commentModel';
import Post from '@/models/postModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const deleteComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId, commentId } = req.params;

    const comment = await Comment.findOneAndDelete({
      user: req.currentuser?._id,
      post: postId,
      _id: commentId,
    });

    if (!comment) return next(new appError('comment not found', 404));

    const replies = await Comment.deleteMany({ parentComment: commentId });
    const deletedCount = replies.deletedCount + 1;

    await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: -deletedCount },
    });

    res.status(204).json({
      status: 'success',
    });
  },
);
