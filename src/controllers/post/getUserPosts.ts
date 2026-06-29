import Follow from '@/models/followModel';
import Post from '@/models/postModel';
import catchAsync from '@/utils/catchAsync';
import redisClient from '@/utils/redis';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response } from 'express';

export const getUserPosts = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 2;
  const skip = (page - 1) * limit;

  const isFollower = await Follow.exists({
    follower: req.currentuser?._id,
    following: req.targetUser?._id,
    status: 'accepted',
  });

  const can = [];
  if (isFollower) can.push('followers');
  if (req.targetUser?.public) can.push('public');

  const authorData = {
    _id: req.targetUser?._id,
    username: req.targetUser?.username,
    profilePhoto: req.targetUser?.profilePhoto,
    firstName: req.targetUser?.firstName,
    lastName: req.targetUser?.lastName,
  };

  const filter = {
    author: req.targetUser?._id,
    whoCanSee: { $in: can },
    status: 'published',
  };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .select('-__v -status')
      .sort('-publishedAt')
      .limit(limit)
      .skip(skip)
      .lean(),

    Post.countDocuments(filter),
  ]);

  const keys = posts.map((post) => `likes:post:${post._id}`);
  const pendingCounts = keys.length ? await redisClient.mGet(keys) : [];

  const result = posts.map((post, i) => ({
    ...post,
    author: authorData,
    likesCount: post.likesCount + Number(pendingCounts[i] || 0),
  }));

  sendResponse(
    res,
    200,
    { posts: result },
    { pagination: { page, limit, total }, results: posts.length },
  );
});
