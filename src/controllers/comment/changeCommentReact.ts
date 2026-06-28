import Block from '@/models/blockModel';
import Comment from '@/models/commentModel';
import Like from '@/models/likeModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const changeCommentReact = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId, commentId } = req.params;
    const type = req.body?.type;

    const comment = await Comment.findById(commentId);

    if (!comment || comment?.post.toString() !== postId.toString())
      return next(new appError('comment not exist', 404));

    const block = await Block.exists({
      $or: [
        { blocker: req.currentuser?._id, blocked: comment.user },
        { blocked: req.currentuser?._id, blocker: comment.user },
      ],
    });

    if (block) return next(new appError('comment not exist', 404));

    const like = await Like.findOne({
      user: req.currentuser!._id,
      comment: commentId,
    });
    if (!like) return next(new appError('react not found', 404));

    like.type = type;
    await like.save();

    sendResponse(res, 200, { like });
  },
);
