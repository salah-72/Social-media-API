import Block from '@/models/blockModel';
import Comment from '@/models/commentModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

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

    const replies = await Comment.find({
      post: postId,
      user: { $nin: blocksIds },
      parentComment: commentId,
    })
      .select('-post -parentComment -_id -__v')
      .populate('user', 'username profilePhoto firstName lastName')
      .sort('createdAt')
      .skip(skip)
      .limit(limit)
      .lean();

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
