import Like from '@/models/likeModel';
import Post from '@/models/postModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const likePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const type = req.body?.type || 'like';
    const post = await Post.findById(postId);

    try {
      const like = await Like.create({
        user: req.currentuser?._id,
        post: postId,
        type,
      });

      await Post.updateOne({ _id: postId }, { $inc: { likesCount: 1 } });

      return res.status(201).json({
        status: 'success',
        data: {
          likesCount: post!.likesCount + 1,
          like,
        },
      });
    } catch (err: any) {
      if (err.code === 11000) {
        await Like.deleteOne({ user: req.currentuser?._id, post: postId });

        await Post.updateOne({ _id: postId }, { $inc: { likesCount: -1 } });

        return res.status(204).json({
          status: 'success',
        });
      }
      throw err;
    }
  },
);
