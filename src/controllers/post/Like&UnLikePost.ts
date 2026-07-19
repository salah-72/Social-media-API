import { incrementLike, decrementLike } from '@/functions/likeCounter';
import Like from '@/models/likeModel';
import Post from '@/models/postModel';
import catchAsync from '@/utils/catchAsync';
import Notification from '@/models/notificationModel';
import { sendNotification } from '@/utils/sendNotification';
import { removeRealtimeNotification } from '@/socket';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';
import appError from '@/utils/appError';
import redisClient from '@/utils/redis';

export const likePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const type = req.body?.type || 'like';

    const post = await Post.findById(postId).select('author').lean();

    try {
      await Like.create({
        user: req.currentuser!._id,
        post: postId,
        type,
      });

      await Promise.all([
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
        const notification = await Notification.findOneAndDelete({
          recipient: post!.author,
          sender: req.currentuser!._id,
          type: 'like',
          post: postId,
        });

        if (notification) {
          await removeRealtimeNotification(
            post!.author.toString(),
            notification._id.toString(),
          );
          if (!notification.isRead) {
            const currentCount = await redisClient.get(
              `user:unread_notifications:${post!.author}`,
            );
            if (currentCount && parseInt(currentCount) > 0) {
              await redisClient.decr(
                `user:unread_notifications:${post!.author}`,
              );
            }
          }
        }

        await Promise.all([
          Like.deleteOne({ user: req.currentuser!._id, post: postId }),
          decrementLike('post', postId),
        ]);

        return res.status(204).send();
      }
      throw err;
    }
  },
);
