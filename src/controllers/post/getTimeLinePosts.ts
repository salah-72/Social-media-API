import Follow from '@/models/followModel';
import Post from '@/models/postModel';
import catchAsync from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';
import { getUsersFromCache } from '@/utils/getUsersFromCache';
import redisClient from '@/utils/redis';
import { Request, Response } from 'express';

export const timeLinePosts = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const id = req.currentuser?._id;
  const followings = await Follow.find({
    follower: id,
    status: 'accepted',
  }).select('following -_id');
  const followingIds = followings.map((e) => e.following);
  const blockIds = [...(req.blockIds ?? [])];

  const myLimit = Math.floor(limit * 0.2);
  const followingLimit = Math.ceil(limit * 0.6);
  const othersLimit = limit - myLimit - followingLimit;

  const mySkip = Math.floor(skip * 0.2);
  const followingSkip = Math.ceil(skip * 0.6);
  const othersSkip = skip - mySkip - followingSkip;

  const myFilter = { status: 'published', author: id };
  const followingFilter = {
    author: { $in: followingIds },
    status: 'published',
    whoCanSee: { $in: ['public', 'followers'] },
  };
  const othersFilter = {
    author: { $nin: [...blockIds, ...followingIds, id!] },
    status: 'published',
    whoCanSee: 'public',
  };

  const [
    myPosts,
    followingsPosts,
    othersPosts,
    myTotal,
    followingTotal,
    othersTotal,
  ] = await Promise.all([
    Post.find(myFilter)
      .select('-__v')
      .sort('-publishedAt')
      .limit(myLimit)
      .skip(mySkip)
      .lean(),
    Post.find(followingFilter)
      .select('-__v')
      .sort('-publishedAt')
      .limit(followingLimit)
      .skip(followingSkip)
      .lean(),
    Post.find(othersFilter)
      .select('-__v')
      .sort('-publishedAt')
      .limit(othersLimit)
      .skip(othersSkip)
      .lean(),
    Post.countDocuments(myFilter),
    Post.countDocuments(followingFilter),
    Post.countDocuments(othersFilter),
  ]);

  const allPosts = [...myPosts, ...followingsPosts, ...othersPosts].sort(
    (a, b) => b.publishedAt!.getTime() - a.publishedAt!.getTime(),
  );

  const authorIds = allPosts.map((p) => p.author.toString());
  const authors = await getUsersFromCache(authorIds);

  const keys = allPosts.map((post) => `likes:post:${post._id}`);
  const pendingCounts = keys.length ? await redisClient.mGet(keys) : [];

  const posts = allPosts
    .map((post, idx) => {
      if (!authors[idx]) return null;
      return {
        ...post,
        author: authors[idx],
        likesCount: post.likesCount + Number(pendingCounts[idx] || 0),
      };
    })
    .filter(Boolean);

  const total = myTotal + followingTotal + othersTotal;

  sendResponse(
    res,
    200,
    { posts },
    { pagination: { page, limit, total }, results: posts.length },
  );
});
