import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import Post from '@/models/postModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const postsSearch = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const input = req.query.text?.toString();
    if (!input) return next(new appError('search query is required', 400));

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const blocks = await Block.find({
      $or: [
        { blocked: req.currentuser?._id },
        { blocker: req.currentuser?._id },
      ],
    });

    const BlocksIds = blocks.map((e) => {
      if (e.blocker.toString() === req.currentuser?._id.toString())
        return e.blocked;
      else return e.blocker;
    });

    const followings = await Follow.find({
      follower: req.currentuser?._id,
      status: 'accepted',
    }).select('following -_id');

    const followingsIds = followings.map((e) => e.following);

    const posts = await Post.aggregate([
      {
        $search: {
          index: 'posts_search',
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
          author: { $nin: BlocksIds },
          $or: [
            { whoCanSee: 'public' },
            { whoCanSee: 'followers', author: { $in: followingsIds } },
            { whoCanSee: 'me', author: req.currentuser?._id },
          ],
        },
      },
      {
        $addFields: {
          score: { $meta: 'searchScore' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
        },
      },
      {
        $unwind: '$author',
      },
      {
        $project: {
          'author.username': 1,
          'author.profilePhoto': 1,
          'author.firstName': 1,
          'author.lastName': 1,
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
