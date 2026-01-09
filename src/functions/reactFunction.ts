import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import Like from '@/models/likeModel';
import Post from '@/models/postModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

export const reactFun = (reactType: string) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post || post.status === 'draft')
      return next(new appError('post not found', 404));

    const isOwner = req.currentuser?._id.toString() === post.author.toString();

    if (!isOwner) {
      if (post.whoCanSee === 'me')
        return next(new appError('post not exist', 404));

      const block = await Block.exists({
        $or: [
          { blocker: req.currentuser?._id, blocked: post.author },
          { blocked: req.currentuser?._id, blocker: post.author },
        ],
      });
      if (block) return next(new appError('post not exist', 404));

      const isFollower = await Follow.exists({
        follower: req.currentuser?._id,
        following: post?.author,
        status: 'accepted',
      });

      if (!isFollower && post.whoCanSee === 'followers')
        return next(new appError('post not exist', 404));
    }

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

    const users = await Like.aggregate([
      {
        $match: {
          post: new Types.ObjectId(postId),
          type: reactType,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $match: {
          'user._id': { $nin: blockIds },
          'user.active': true,
        },
      },
      {
        $project: {
          'user.username': 1,
          'user.profilePhoto': 1,
          'user.firstName': 1,
          'user.lastName': 1,
          _id: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    const length = await Like.countDocuments({ post: postId, type: reactType });

    res.status(200).json({
      status: 'success',
      data: {
        length,
        users,
      },
    });
  });
