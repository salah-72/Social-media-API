import { incrementLike, decrementLike } from '@/functions/likeCounter';
import Like from '@/models/likeModel';
import Post from '@/models/postModel';
import catchAsync from '@/utils/catchAsync';
import { sendNotification } from '@/utils/sendNotification';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';
import { deleteNotification } from '@/utils/deleteNotification';

export const likePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const type = req.body?.type || 'like';

    const post = await Post.findById(postId).select('author').lean();

    try {
      await Promise.all([
        Like.create({
          user: req.currentuser!._id,
          post: postId,
          type,
        }),
        incrementLike('post', postId),
        sendNotification({
          recipient: post!.author,
          sender: req.currentuser!._id,
          type: 'like',
          post: postId,
        }),
      ]);

      return sendResponse(res, 201, undefined, { message: 'post liked' });
    } catch (err: any) {
      if (err.code === 11000) {
        await Promise.all([
          deleteNotification({
            recipient: post!.author,
            sender: req.currentuser!._id,
            type: 'like',
            post: postId,
          }),
          Like.deleteOne({ user: req.currentuser!._id, post: postId }),
          decrementLike('post', postId),
        ]);

        return res.status(204).send();
      }
      throw err;
    }
  },
);
