import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import Post from '@/models/postModel';
import catchAsync from '@/utils/catchAsync';
import { getUsersFromCache } from '@/utils/getUsersFromCache';
import { Request, Response } from 'express';

export const timeLinePosts = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const id = req.currentuser?._id;

  const myLimit = Math.floor(limit * 0.2);
  const followingLimit = Math.ceil(limit * 0.6);
  const othersLimit = limit - myLimit - followingLimit;

  const mySkip = Math.floor(skip * 0.2);
  const followingSkip = Math.ceil(skip * 0.6);
  const othersSkip = skip - mySkip - followingSkip;

  const followings = await Follow.find({
    follower: id,
    status: 'accepted',
  }).select('following -_id');

  const followingIds = followings.map((e) => {
    return e.following;
  });

  const blockIds = [...(req.blockIds ?? [])];

  const [myPosts, followingsPosts, othersPosts] = await Promise.all([
    Post.find({ status: 'published', author: id })
      .select('-__v')
      .sort('-publishedAt')
      .limit(myLimit)
      .skip(mySkip)
      .lean(),

    Post.find({
      author: { $in: followingIds },
      status: 'published',
      whoCanSee: { $in: ['public', 'followers'] },
    })
      .select('-__v')
      .sort('-publishedAt')
      .limit(followingLimit)
      .skip(followingSkip)
      .lean(),

    Post.find({
      author: { $nin: [...blockIds, ...followingIds, id!] },
      status: 'published',
      whoCanSee: 'public',
    })
      .select('-__v')
      .sort('-publishedAt')
      .limit(othersLimit)
      .skip(othersSkip)
      .lean(),
  ]);

  const allPosts = [...myPosts, ...followingsPosts, ...othersPosts].sort(
    (a, b) => b.publishedAt!.getTime() - a.publishedAt!.getTime(),
  );

  const authorIds = allPosts.map((p) => p.author.toString());
  const authors = await getUsersFromCache(authorIds);

  const posts = allPosts
    .map((post, idx) => {
      if (!authors[idx]) return null;
      return { ...post, author: authors[idx] };
    })
    .filter(Boolean);

  res.status(200).json({
    status: 'success',
    data: {
      page,
      limit,
      length: posts.length,
      posts,
    },
  });
});
