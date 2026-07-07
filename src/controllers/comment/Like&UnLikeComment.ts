import { incrementLike, decrementLike } from '@/functions/likeCounter';
import Block from '@/models/blockModel';
import Comment from '@/models/commentModel';
import Like from '@/models/likeModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
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

      await incrementLike('comment', commentId);

      return sendResponse(res, 201, undefined, { message: 'comment liked' });
    } catch (err: any) {
      if (err.code === 11000) {
        await Like.deleteOne({
          user: req.currentuser?._id,
          comment: commentId,
        });

        await decrementLike('comment', commentId);

        return res.status(204).send();
      }
      throw err;
    }
  },
);
