import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import Post from '@/models/postModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const timeLinePosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const id = req.currentuser?._id;

    const myLimit = Math.floor(limit * 0.2);
    const followersLimit = Math.ceil(limit * 0.6);
    const othersLimit = limit - myLimit - followersLimit;

    const mySkip = Math.floor(skip * 0.2);
    const followersSkip = Math.ceil(skip * 0.6);
    const othersSkip = skip - mySkip - followersSkip;

    const myPosts = await Post.find({
      author: id,
      status: 'published',
    })
      .sort('-publishedAt')
      .populate('author', 'username profilePhoto')
      .limit(myLimit)
      .skip(mySkip);

    const followers = await Follow.find({
      follower: id,
      status: 'accepted',
    }).select('following -_id');

    const followersIds = followers.map((e) => {
      return e.following;
    });

    const followersPosts = await Post.find({
      author: { $in: followersIds },
      status: 'published',
      whoCanSee: { $in: ['public', 'followers'] },
    })
      .sort('-publishedAt')
      .limit(followersLimit)
      .skip(followersSkip);

    const blocks = await Block.find({
      $or: [{ blocker: id }, { blocked: id }],
    });

    const blocksIds = blocks.map((e) => {
      if (e.blocker.toString() === id?.toString()) return e.blocked;
      else return e.blocker;
    });

    const othersPosts = await Post.find({
      author: { $nin: [...blocksIds, ...followersIds, id!] },
      status: 'published',
      whoCanSee: 'public',
    })
      .sort('-publishedAt')
      .limit(othersLimit)
      .skip(othersSkip);

    const posts = [...myPosts, ...followersPosts, ...othersPosts].sort(
      (a, b) => b.publishedAt!.getTime() - a.publishedAt!.getTime(),
    );

    res.status(200).json({
      status: 'success',
      data: {
        page,
        limit,
        length: posts.length,
        posts,
      },
    });
  },
);
