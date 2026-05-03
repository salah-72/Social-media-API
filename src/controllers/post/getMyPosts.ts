import Post from '@/models/postModel';
import catchAsync from '@/utils/catchAsync';
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
