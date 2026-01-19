import Story from '@/models/storyModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const getMyStories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const stories = await Story.find({ author: req.currentuser?._id })
      .select('-_id -__v -whoCanSee -updatedAt')
      .populate('author', 'username profilePhoto firstName lastName')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      status: 'success',
      data: {
        page,
        limit,
        length: stories.length,
        stories,
      },
    });
  },
);
