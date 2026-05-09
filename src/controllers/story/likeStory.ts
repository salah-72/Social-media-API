import { incrementLike, decrementLike } from '@/functions/likeCounter';
import Like from '@/models/likeModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const likeStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { storyId } = req.params;
    const type = req.body?.type || 'like';

    if (req.story?.author._id.toString() === req.currentuser?._id.toString())
      return next(new appError('you cannot like your story', 400));

    try {
      const like = await Like.create({
        user: req.currentuser?._id,
        story: storyId,
        type,
      });

      await incrementLike('story', storyId);

      return res.status(201).json({
        status: 'success',
        data: {
          likesCount: req.story!.likesCount + 1,
          like,
        },
      });
    } catch (err: any) {
      if (err.code === 11000) {
        await Like.deleteOne({ user: req.currentuser?._id, story: storyId });

        await decrementLike('story', storyId);

        return res.status(204).json({
          status: 'success',
        });
      }
      throw err;
    }
  },
);
