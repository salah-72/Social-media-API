import Story from '@/models/storyModel';
import View from '@/models/viewModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const getViewers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { storyId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const story = await Story.findById(storyId).select('author');
    if (!story || story.author.toString() !== req.currentuser?._id.toString())
      return next(new appError('story not found', 404));

    const views = await View.find({ story: storyId })
      .select('-story -_id -__v')
      .populate('user', 'username profilePhoto firstName lastName')
      .sort('-at')
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      status: 'success',
      data: {
        page,
        limit,
        viewsCount: views.length,
        views,
      },
    });
  },
);
