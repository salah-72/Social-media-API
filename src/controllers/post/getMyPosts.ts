import Post from '@/models/postModel';
import catchAsync from '@/utils/catchAsync';
import redisClient from '@/utils/redis';
import { Request, Response } from 'express';

export const getMyPosts = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  const authorData = {
    _id: req.currentuser?._id,
    username: req.currentuser?.username,
    profilePhoto: req.currentuser?.profilePhoto,
    firstName: req.currentuser?.firstName,
    lastName: req.currentuser?.lastName,
  };

  const posts = await Post.find({
    author: req.currentuser?._id,
    status: 'published',
  })
    .select('-__v -author')
    .sort('-createdAt')
    .limit(limit)
    .skip(skip)
    .lean();

  const keys = posts.map((post) => `likes:post:${post._id}`);
  const pendingCounts = keys.length ? await redisClient.mGet(keys) : [];

  const result = posts.map((post, i) => ({
    ...post,
    author: authorData,
    likesCount: post.likesCount + Number(pendingCounts[i] || 0),
  }));

  res.status(200).json({
    status: 'success',
    data: {
      page,
      limit,
      length: posts.length,
      posts: result,
    },
  });
});
