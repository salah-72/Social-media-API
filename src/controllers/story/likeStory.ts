import { incrementLike, decrementLike } from '@/functions/likeCounter';
import Like from '@/models/likeModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { deleteNotification } from '@/utils/deleteNotification';
import { sendNotification } from '@/utils/sendNotification';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const likeStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { storyId } = req.params;
    const type = req.body?.type || 'like';

    if (req.story?.author._id.toString() === req.currentuser?._id.toString())
      return next(new appError('you cannot like your story', 400));

    try {
      await Like.create({
        user: req.currentuser?._id,
        story: storyId,
        type,
      });

      await Promise.all([
        incrementLike('story', storyId),
        sendNotification({
          recipient: req.story!.author,
          sender: req.currentuser!._id,
          type: 'like',
          story: req.story!._id,
        }),
      ]);

      return sendResponse(res, 201, undefined, { message: 'story liked' });
    } catch (err: any) {
      if (err.code === 11000) {
        await deleteNotification({
          recipient: req.story!.author,
          sender: req.currentuser!._id,
          type: 'like',
          story: req.story!._id,
        });
        await Promise.all([
          Like.deleteOne({ user: req.currentuser?._id, story: storyId }),
          decrementLike('story', storyId),
        ]);

        return res.status(204).send();
      }
      throw err;
    }
  },
);
