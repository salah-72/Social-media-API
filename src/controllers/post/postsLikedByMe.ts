import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import Like from '@/models/likeModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const postsLikedByMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const blocks = await Block.find({
      $or: [
        { blocker: req.currentuser?._id },
        { blocked: req.currentuser?._id },
      ],
    });
    const blockIds = blocks.map((e) => {
      if (e.blocker.toString() === req.currentuser?._id.toString())
        return e.blocked;
      else return e.blocker;
    });

    const followings = await Follow.find({
      follower: req.currentuser?._id,
      status: 'accepted',
    });
    const followingIds = followings.map((e) => e.following);

    const posts = await Like.aggregate([
      {
        $match: {
          user: req.currentuser?._id,
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'post',
          foreignField: '_id',
          as: 'post',
        },
      },
      {
        $unwind: '$post',
      },
      {
        $match: {
          'post.status': 'published',
          'post.author': { $nin: blockIds },
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
      { $limit: limit },
      { $skip: skip },
    ]);

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
