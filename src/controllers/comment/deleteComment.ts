import Comment from '@/models/commentModel';
import Post from '@/models/postModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { logger } from '@/lib/winston';
import { deleteNotification } from '@/utils/deleteNotification';
import { sendNotification } from '@/utils/sendNotification';
import { Request, Response, NextFunction } from 'express';
import { canModerate } from '@/functions/role';

export const deleteComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId, commentId } = req.params;

    const comment = await Comment.findOne({
      post: postId,
      _id: commentId,
    });
    if (!comment) return next(new appError('comment not found', 404));

    const isOwner = comment.user.toString() === req.currentuser?._id.toString();
    const isAdmin = canModerate(req.currentuser?.role);

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

    if (isAdmin && !isOwner) {
      logger.info(
        `admin: ${req.currentuser?._id} removed comment ${commentId} belonging to ${comment.user}`,
      );

      try {
        await sendNotification({
          recipient: comment.user,
          sender: req.currentuser!._id,
          type: 'comment_removed',
          post: postId,
          comment: commentId,
        });
      } catch (err) {
        logger.error('failed to send comment_removed notification', {
          commentId,
          recipient: comment.user,
          err,
        });
      }
    }

    res.status(204).send();
  },
);
