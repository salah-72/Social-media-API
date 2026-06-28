import Comment from '@/models/commentModel';
import Post from '@/models/postModel';
import catchAsync from '@/utils/catchAsync';
import { getUsersFromCache } from '@/utils/getUsersFromCache';
import redisClient from '@/utils/redis';
import { sendResponse } from '@/utils/sendResponse';
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

  const keys = comments.map((comment) => `likes:comment:${comment._id}`);
  const pendingCounts = keys.length ? await redisClient.mGet(keys) : [];

  const result = comments
    .map((comment, idx) => {
      if (!users[idx]) return null;
      return {
        ...comment,
        user: users[idx],
        likesCount: comment.likesCount + Number(pendingCounts[idx] || 0),
      };
    })
    .filter(Boolean);

  const total = await Comment.countDocuments({
    post: new Types.ObjectId(postId),
    user: { $nin: blocksIds },
    parentComment: null,
  });

  sendResponse(
    res,
    200,
    { comments: result },
    { pagination: { page, limit, total }, results: result.length },
  );
});
