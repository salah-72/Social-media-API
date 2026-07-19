import { incrementLike, decrementLike } from '@/functions/likeCounter';
import Comment from '@/models/commentModel';
import Like from '@/models/likeModel';
import Notification from '@/models/notificationModel';
import appError from '@/utils/appError';
import redisClient from '@/utils/redis';
import catchAsync from '@/utils/catchAsync';
import { sendNotification } from '@/utils/sendNotification';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const likeComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId, commentId } = req.params;
    const type = req.body?.type || 'like';
    const comment = await Comment.findById(commentId);

    if (!comment || comment?.post.toString() !== postId.toString())
      return next(new appError('comment not exist', 404));

    const blockIds = [...(req.blockIds ?? [])];
    if (blockIds.some((id) => id.toString() === comment.user.toString()))
      return next(new appError('comment not exist', 404));

    try {
      await Like.create({
        user: req.currentuser?._id,
        comment: commentId,
        type,
      });

      await Promise.all([
        incrementLike('comment', commentId),
        sendNotification({
          recipient: comment.user,
          sender: req.currentuser!._id,
          comment: commentId,
          type: 'comment_like',
        }),
      ]);

      return sendResponse(res, 201, undefined, { message: 'comment liked' });
    } catch (err: any) {
      if (err.code === 11000) {
        const notification = await Notification.findOneAndDelete({
          recipient: comment.user,
          sender: req.currentuser!._id,
          comment: commentId,
          type: 'comment_like',
        });

        if (notification && !notification.isRead) {
          const currentCount = await redisClient.get(
            `user:unread_notifications:${comment.user}`,
          );
          if (currentCount && parseInt(currentCount) > 0) {
            await redisClient.decr(`user:unread_notifications:${comment.user}`);
          }
        }

        await Promise.all([
          Like.deleteOne({
            user: req.currentuser?._id,
            comment: commentId,
          }),

          decrementLike('comment', commentId),
        ]);

        return res.status(204).send();
      }
      throw err;
    }
  },
);
