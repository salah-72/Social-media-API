import Story from '@/models/storyModel';
import catchAsync from '@/utils/catchAsync';
import redisClient from '@/utils/redis';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response } from 'express';

export const getMyStories = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const authorData = {
    username: req.currentuser?.username,
    profilePhoto: req.currentuser?.profilePhoto,
    firstName: req.currentuser?.firstName,
    lastName: req.currentuser?.lastName,
  };

  const filter = {
    author: req.currentuser?._id,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  };

  const [stories, total] = await Promise.all([
    Story.find(filter)
      .select('-__v -whoCanSee -updatedAt')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),

    Story.countDocuments(filter),
  ]);

  const keys = stories.map((story) => `likes:story:${story._id}`);
  const pendingCounts = keys.length ? await redisClient.mGet(keys) : [];

  const result = stories.map((story, i) => ({
    ...story,
    author: authorData,
    likesCount: story.likesCount + Number(pendingCounts[i] || 0),
  }));

  sendResponse(
    res,
    200,
    { stories: result },
    { pagination: { page, limit, total }, results: stories.length },
  );
});
