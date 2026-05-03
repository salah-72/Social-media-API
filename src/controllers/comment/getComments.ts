import Block from '@/models/blockModel';
import Comment from '@/models/commentModel';
import Post from '@/models/postModel';
import catchAsync from '@/utils/catchAsync';
import { getUsersFromCache } from '@/utils/getUsersFromCache';
import { Request, Response } from 'express';
import { Types } from 'mongoose';

export const getComments = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const blocksIds = [...(req.blockIds ?? [])];

  const post = await Post.findById(postId)
    .select('-status -__v')
    .populate('author', 'username profilePhoto firstName lastName')
    .lean();

  const comments = await Comment.aggregate([
    {
      $match: {
        post: new Types.ObjectId(postId),
        user: { $nin: blocksIds },
        parentComment: null,
      },
    },
    {
      $project: {
        user: 1,
        content: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ]);

  const userIds = comments.map((c) => c.user.toString());
  const users = await getUsersFromCache(userIds);
  const commentsWithUser = comments
    .map((comment, idx) => {
      if (!users[idx]) return null;
      return { ...comment, user: users[idx] };
    })
    .filter(Boolean);

  res.status(200).json({
    status: 'success',
    data: {
      page,
      limit,
      post,
      comments: commentsWithUser,
    },
  });
});
