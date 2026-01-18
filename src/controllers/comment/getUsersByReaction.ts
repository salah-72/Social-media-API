import Block from '@/models/blockModel';
import Comment from '@/models/commentModel';
import Like from '@/models/likeModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

export const usersByReaction = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { commentId, postId, type } = req.params;

    const allowedTypes = [
      'like',
      'love',
      'care',
      'sad',
      'angry',
      'haha',
      'wow',
    ];
    if (!allowedTypes.includes(type))
      return next(new appError('invalid reaction type', 400));

    const comment = await Comment.findById(commentId);

    if (!comment || comment?.post.toString() !== postId.toString())
      return next(new appError('comment not exist', 404));

    const block = await Block.exists({
      $or: [
        { blocker: req.currentuser?._id, blocked: comment.user },
        { blocked: req.currentuser?._id, blocker: comment.user },
      ],
    });

    if (block) return next(new appError('comment not exist', 404));

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
          comment: new Types.ObjectId(commentId),
          type,
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
      { $skip: skip },
      { $limit: limit },
    ]);

    const likesCount = await Like.countDocuments({ comment: commentId, type });

    res.status(200).json({
      status: 'success',
      data: {
        page,
        limit,
        likesCount,
        users,
      },
    });
  },
);
