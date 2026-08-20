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

    if (req.story?.author.toString() === req.currentuser?._id.toString())
      return next(new appError('you cannot like your story', 400));

    const existingLike = await Like.findOne({
      user: req.currentuser?._id,
      story: storyId,
    });

    if (existingLike) {
      if (existingLike.type === type) {
        await Promise.all([
          Like.deleteOne({ _id: existingLike._id }),
          decrementLike('story', storyId),
          deleteNotification({
            recipient: req.story!.author,
            sender: req.currentuser!._id,
            type: 'like',
            story: req.story!._id,
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
          story: storyId,
          type,
        }),
        incrementLike('story', storyId),
        sendNotification({
          recipient: req.story!.author,
          sender: req.currentuser!._id,
          type: 'like',
          story: req.story!._id,
        }),
      ]);

      return sendResponse(res, 201, undefined, { message: 'story liked' });
    }
  },
);
