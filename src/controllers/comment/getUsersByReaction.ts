import Block from '@/models/blockModel';
import Comment from '@/models/commentModel';
import Like from '@/models/likeModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { getUsersFromCache } from '@/utils/getUsersFromCache';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

export const usersByReaction = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { commentId, postId, type } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment || comment?.post.toString() !== postId.toString())
      return next(new appError('comment not exist', 404));

    const blockIds = [...(req.blockIds ?? [])];
    if (blockIds.some((id) => id.toString() === comment.user.toString()))
      return next(new appError('comment not exist', 404));

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 40;
    const skip = (page - 1) * limit;

    const [likes, likesCount] = await Promise.all([
      Like.find({
        comment: new Types.ObjectId(commentId),
        type,
        user: { $nin: blockIds },
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Like.countDocuments({
        comment: new Types.ObjectId(commentId),
        type,
        user: { $nin: blockIds },
      }),
    ]);

    const userIds = likes.map((l) => l.user.toString());
    const cachedUsers = await getUsersFromCache(userIds);
    const users = likes
      .map((like, idx) => {
        if (!cachedUsers[idx]) return null;
        return { ...like, user: cachedUsers[idx] };
      })
      .filter(Boolean);

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
