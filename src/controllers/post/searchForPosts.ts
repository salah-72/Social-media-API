import Follow from '@/models/followModel';
import Post from '@/models/postModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { getUsersFromCache } from '@/utils/getUsersFromCache';
import redisClient from '@/utils/redis';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const postsSearch = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const input = req.query.text?.toString();
    if (!input) return next(new appError('search query is required', 400));

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const BlocksIds = req.blockIds;

    const followings = await Follow.find({
      follower: req.currentuser?._id,
      status: 'accepted',
    }).select('following -_id');

    const followingsIds = followings.map((e) => e.following);

    const pipeline = [
      {
        $search: {
          index: 'search',
          text: {
            query: input,
            path: 'content',
            fuzzy: { maxEdits: 2 },
          },
        },
      },
      {
        $match: {
          status: 'published',
          author: { $nin: [...(BlocksIds ?? [])] },
          $or: [
            { whoCanSee: 'public' },
            { whoCanSee: 'followers', author: { $in: followingsIds } },
            { whoCanSee: 'me', author: req.currentuser?._id },
          ],
        },
      },
    ];

    const [posts, totalResult] = await Promise.all([
      Post.aggregate([
        ...pipeline,
        {
          $addFields: {
            score: { $meta: 'searchScore' },
          },
        },
        {
          $project: {
            author: 1,
            content: 1,
            status: 1,
            whoCanSee: 1,
            likesCount: 1,
            commentsCount: 1,
            publishedAt: 1,
            score: 1,
          },
        },
        { $sort: { score: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]),

      Post.aggregate([...pipeline, { $count: 'total' }]),
    ]);

    const total = totalResult[0]?.total ?? 0;

    const authorIds = posts.map((p) => p.author.toString());
    const authorsData = await getUsersFromCache(authorIds);

    const keys = posts.map((post) => `likes:post:${post._id}`);
    const pendingCounts = keys.length ? await redisClient.mGet(keys) : [];

    const result = posts
      .map((post, i) => {
        if (!authorsData[i]) return null;
        return {
          ...post,
          author: authorsData[i],
          likesCount: post.likesCount + Number(pendingCounts[i] || 0),
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
