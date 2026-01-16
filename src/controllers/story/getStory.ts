import Story from '@/models/storyModel';
import View from '@/models/viewModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const getUserStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const story = req.story!;

    if (story.author.toString() !== req.currentuser?._id.toString()) {
      try {
        await View.create({
          story: story._id,
          user: req.currentuser?._id,
        });
        await Story.findByIdAndUpdate(story._id, { $inc: { viewsCount: 1 } });
      } catch (err: any) {
        if (err.code !== 11000) throw err;
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        story,
      },
    });
  },
);
