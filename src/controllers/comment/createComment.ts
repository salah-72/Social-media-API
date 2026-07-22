import Comment from '@/models/commentModel';
import Post from '@/models/postModel';
import catchAsync from '@/utils/catchAsync';
import { sendNotification } from '@/utils/sendNotification';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response } from 'express';

export const createComment = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { content } = req.body;

  const comment = await Comment.create({
    user: req.currentuser?._id,
    post: postId,
    parentComment: null,
    content,
  });

  await Promise.all([
    sendNotification({
      recipient: req.post!.author,
      sender: req.currentuser!._id,
      type: 'comment',
      post: postId,
    }),
    Post.updateOne({ _id: postId }, { $inc: { commentsCount: 1 } }),
  ]);

  sendResponse(res, 201, { comment });
});
