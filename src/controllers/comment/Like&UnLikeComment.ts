import { incrementLike, decrementLike } from '@/functions/likeCounter';
import Comment from '@/models/commentModel';
import Like from '@/models/likeModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { sendNotification } from '@/utils/sendNotification';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';
import { deleteNotification } from '@/utils/deleteNotification';

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

    const existingLike = await Like.findOne({
      user: req.currentuser?._id,
      comment: commentId,
    });

    if (existingLike) {
      if (existingLike.type === type) {
        await Promise.all([
          Like.deleteOne({ _id: existingLike._id }),
          decrementLike('comment', commentId),
          deleteNotification({
            recipient: comment.user,
            sender: req.currentuser!._id,
            comment: commentId,
            type: 'comment_like',
          }),
        ]);

        return res.status(204).send();
      } else {
        existingLike.type = type;
        await existingLike.save();
        return sendResponse(res, 200, undefined, {
          message: 'like type updated',
        });
      }
    } else {
      await Promise.all([
        Like.create({
          user: req.currentuser?._id,
          comment: commentId,
          type,
        }),
        incrementLike('comment', commentId),
        sendNotification({
          recipient: comment.user,
          sender: req.currentuser!._id,
          comment: commentId,
          type: 'comment_like',
        }),
      ]);

      return sendResponse(res, 201, undefined, { message: 'comment liked' });
    }
  },
);
