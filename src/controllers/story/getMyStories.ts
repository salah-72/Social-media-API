import Story from '@/models/storyModel';
import catchAsync from '@/utils/catchAsync';
import { mergeLikesCount } from '@/functions/mergeLikesCount';
import { Request, Response } from 'express';

export const getMyStories = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const stories = await Story.find({
    author: req.currentuser?._id,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  })
    .select('-__v -whoCanSee -updatedAt')
    .populate('author', 'username profilePhoto firstName lastName')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .lean();

  const result = await mergeLikesCount(stories, 'story');

  res.status(200).json({
    status: 'success',
    data: {
      page,
      limit,
      length: stories.length,
      stories: result,
    },
  });
});
