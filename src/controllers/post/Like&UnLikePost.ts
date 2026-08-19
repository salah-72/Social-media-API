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

    const existingLike = await Like.findOne({
      user: req.currentuser!._id,
      post: postId,
    });

    if (existingLike) {
      if (existingLike.type === type) {
        await Promise.all([
          deleteNotification({
            recipient: post!.author,
            sender: req.currentuser!._id,
            type: 'like',
            post: postId,
          }),
          Like.deleteOne({ _id: existingLike._id }),
          decrementLike('post', postId),
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
    }
  },
);
