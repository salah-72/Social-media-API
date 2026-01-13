import Block from '@/models/blockModel';
import Comment from '@/models/commentModel';
import Post from '@/models/postModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const getComments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
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

    const post = await Post.findById(postId)
      .select('-_id -status -__v')
      .populate('author', 'username profilePhoto firstName lastName')
      .lean();

    const comments = await Comment.find({
      post: postId,
      user: { $nin: blocksIds },
      parentComment: null,
    })
      .select('-post -parentComment -_id -__v')
      .populate('user', 'username profilePhoto firstName lastName')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      status: 'success',
      data: {
        page,
        limit,
        post,
        comments,
      },
    });
  },
);
