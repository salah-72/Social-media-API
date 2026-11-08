import { Types } from 'mongoose';
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
  const blockIds = [...(req.blockIds ?? [])].map((b) => new Types.ObjectId(b));

  const networkFilter = {
    status: 'published',
    $or: [
      { author: id! },
      {
        author: { $in: followingIds },
        whoCanSee: { $in: ['public', 'followers'] },
      },
    ],
  };
  const othersFilter = {
    author: { $nin: [...blockIds, ...followingIds, id!] },
    status: 'published',
    whoCanSee: 'public',
  };

  const [allPosts, networkTotal, othersTotal] = await Promise.all([
    Post.aggregate([
      { $match: networkFilter },
      { $addFields: { feedRank: 0 } },
      {
        $unionWith: {
          coll: Post.collection.name,
          pipeline: [{ $match: othersFilter }, { $addFields: { feedRank: 1 } }],
        },
      },
      { $sort: { feedRank: 1, publishedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { __v: 0, feedRank: 0 } },
    ]),
    Post.countDocuments(networkFilter),
    Post.countDocuments(othersFilter),
  ]);

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

  const total = networkTotal + othersTotal;

  sendResponse(
    res,
    200,
    { posts },
    { pagination: { page, limit, total }, results: posts.length },
  );
});
