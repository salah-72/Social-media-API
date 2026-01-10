import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import Like from '@/models/likeModel';
import Post from '@/models/postModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const like = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    const likeExist = await Like.exists({
      user: req.currentuser?._id,
      post: postId,
    });

    await Post.updateOne(
      { _id: postId },
      { $inc: { likesCount: likeExist ? -1 : 1 } },
    );

    if (likeExist) {
      await Like.deleteOne({ user: req.currentuser?._id, post: postId });
      res.status(204).json({
        status: 'success',
      });
    } else {
      const type = req.body?.type || 'like';
      const like = await Like.create({
        user: req.currentuser?._id,
        post: postId,
        type,
      });
      res.status(201).json({
        status: 'success',
        data: {
          likesCount: post!.likesCount,
          like,
        },
      });
    }
  },
);
