import { mergeLikesCount } from '@/functions/mergeLikesCount';
import Story from '@/models/storyModel';
import View from '@/models/viewModel';
import catchAsync from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response } from 'express';

export const getStory = catchAsync(async (req: Request, res: Response) => {
  const story = req.story!;

  if (story.author._id.toString() !== req.currentuser?._id.toString()) {
    try {
      await Promise.all([
        View.create({
          story: story._id,
          user: req.currentuser?._id,
        }),
        Story.findByIdAndUpdate(story._id, { $inc: { viewsCount: 1 } }),
      ]);
    } catch (err: any) {
      if (err.code !== 11000) throw err;
    }
  }

  const [result] = await mergeLikesCount([story], 'story');

  sendResponse(res, 200, { story: result });
});
