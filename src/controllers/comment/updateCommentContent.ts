import Comment from '@/models/commentModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const updateComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId, commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findOneAndUpdate(
      {
        user: req.currentuser?._id,
        post: postId,
        _id: commentId,
      },
      { content: content.trim() },
      { new: true },
    );

    if (!comment) return next(new appError('comment not found', 404));

    sendResponse(res, 200, undefined, { message: 'comment updated' });
  },
);
