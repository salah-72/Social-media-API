import Like from '@/models/likeModel';
import Story from '@/models/storyModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const likeStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { storyId } = req.params;
    const type = req.body?.type || 'like';

    try {
      const like = await Like.create({
        user: req.currentuser?._id,
        story: storyId,
        type,
      });

      await Story.updateOne({ _id: storyId }, { $inc: { likesCount: 1 } });

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

        await Story.updateOne({ _id: storyId }, { $inc: { likesCount: -1 } });

        return res.status(204).json({
          status: 'success',
        });
      }
      throw err;
    }
  },
);
