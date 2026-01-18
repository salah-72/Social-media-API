import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import Like from '@/models/likeModel';
import Post from '@/models/postModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

export const postLikes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 40;
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

    const users = await Like.aggregate([
      {
        $match: {
          post: new Types.ObjectId(postId),
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
          type: 1,
          'user.username': 1,
          'user.profilePhoto': 1,
          'user.firstName': 1,
          'user.lastName': 1,
          _id: 0,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const length = await Like.countDocuments({ post: postId });

    res.status(200).json({
      status: 'success',
      data: {
        page,
        limit,
        length,
        users,
      },
    });
  },
);
