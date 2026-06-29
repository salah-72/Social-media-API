import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import Like from '@/models/likeModel';
import catchAsync from '@/utils/catchAsync';
import { getUsersFromCache } from '@/utils/getUsersFromCache';
import redisClient from '@/utils/redis';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response } from 'express';

export const postsLikedByMe = catchAsync(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const blockIds = req.blockIds;

    const followings = await Follow.find({
      follower: req.currentuser?._id,
      status: 'accepted',
    });
    const followingIds = followings.map((e) => e.following);

    const pipeline = [
      { $match: { user: req.currentuser?._id } },
      {
        $lookup: {
          from: 'posts',
          localField: 'post',
          foreignField: '_id',
          as: 'post',
        },
      },
      { $unwind: '$post' },
      {
        $match: {
          'post.status': 'published',
          'post.author': { $nin: [...(blockIds ?? [])] },
          $or: [
            { 'post.whoCanSee': 'public' },
            {
              'post.whoCanSee': 'followers',
              'post.author': { $in: followingIds },
            },
            { 'post.whoCanSee': 'me', 'post.author': req.currentuser?._id },
          ],
        },
      },
    ];

    const [posts, totalResult] = await Promise.all([
      Like.aggregate([
        ...pipeline,
        {
          $project: {
            'post.author': 1,
            'post.content': 1,
            'post.images.url': 1,
            'post.whoCanSee': 1,
            _id: 0,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),

      Like.aggregate([...pipeline, { $count: 'total' }]),
    ]);

    const total = totalResult[0]?.total ?? 0;

    const authorIds = posts.map((p) => p.post.author.toString());
    const authors = await getUsersFromCache(authorIds);

    const keys = posts.map((post) => `likes:post:${post._id}`);
    const pendingCounts = keys.length ? await redisClient.mGet(keys) : [];

    const result = posts
      .map((p, idx) => {
        if (!authors[idx]) return null;
        return {
          ...p.post,
          author: authors[idx],
          likesCount: p.post.likesCount + Number(pendingCounts[idx] || 0),
        };
      })
      .filter(Boolean);

    sendResponse(
      res,
      200,
      { posts: result },
      { pagination: { page, limit, total }, results: posts.length },
    );
  },
);
