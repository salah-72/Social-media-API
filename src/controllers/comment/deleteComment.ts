import Comment from '@/models/commentModel';
import Post from '@/models/postModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { logger } from '@/lib/winston';
import { deleteNotification } from '@/utils/deleteNotification';
import { Request, Response, NextFunction } from 'express';

export const deleteComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId, commentId } = req.params;

    const comment = await Comment.findOne({
      post: postId,
      _id: commentId,
    });
    if (!comment) return next(new appError('comment not found', 404));

    const isOwner = comment.user.toString() === req.currentuser?._id.toString();
    const isAdmin = req.currentuser?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next(new appError('You are not the owner of this comment', 403));
    }

    await comment.deleteOne();

    const replies = await Comment.deleteMany({ parentComment: commentId });
    const deletedCount = replies.deletedCount + 1;

    await Promise.all([
      Post.updateOne(
        { _id: postId },
        { $inc: { commentsCount: -deletedCount } },
      ),
      deleteNotification({
        recipient: req.post!.author,
        sender: req.currentuser!._id,
        type: 'comment',
        post: postId,
      }),
    ]);

    // TODO: add a notification to the comment author if an admin deleted their comment
    if (isAdmin && !isOwner) {
      logger.info(
        `admin: ${req.currentuser?._id} removed comment ${commentId} belonging to ${comment.user}`,
      );
    }

    res.status(204).send();
  },
);
