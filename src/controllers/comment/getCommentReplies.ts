import Block from '@/models/blockModel';
import Comment from '@/models/commentModel';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

export const commentReplies = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId, commentId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const blocks = await Block.find({
      $or: [
        { blocker: req.currentuser?._id },
        { blocked: req.currentuser?._id },
      ],
    });

    const blocksIds = blocks.map((el) => {
      if (el.blocker.toString() === req.currentuser?._id.toString())
        return el.blocked;
      else return el.blocker;
    });

    const comment = await Comment.findById(commentId)
      .select('-post -parentComment -_id -__v')
      .lean();
    if (
      !comment ||
      blocksIds.some((id) => id.toString() === comment.user.toString())
    )
      return next(new appError('comment not found', 404));

    const userExist = await User.exists({
      _id: comment.user,
      active: true,
    });
    if (!userExist) return next(new appError('comment not found', 404));

    const replies = await Comment.aggregate([
      {
        $match: {
          post: new Types.ObjectId(postId),
          user: { $nin: blocksIds },
          parentComment: new Types.ObjectId(commentId),
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
          content: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      { $sort: { createdAt: 1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        page,
        limit,
        comment,
        repliesLength: replies.length,
        replies,
      },
    });
  },
);
