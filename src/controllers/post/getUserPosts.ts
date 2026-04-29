import Follow from '@/models/followModel';
import Post from '@/models/postModel';
import catchAsync from '@/utils/catchAsync';
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

  const posts = await Post.find({
    author: req.targetUser?._id,
    whoCanSee: { $in: can },
    status: 'published',
  })
    .select('-__v -status')
    .sort('-publishedAt')
    .limit(limit)
    .skip(skip)
    .lean();

  const postsWithAuthor = posts.map((post) => ({
    ...post,
    author: authorData,
  }));

  res.status(200).json({
    status: 'success',
    data: {
      page,
      limit,
      length: posts.length,
      posts: postsWithAuthor,
    },
  });
});
