import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import Like from '@/models/likeModel';
import Post from '@/models/postModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const changeReact = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const type = req.body?.type;

    const like = await Like.findOne({
      user: req.currentuser!._id,
      post: postId,
    });
    if (!like || !type) return next(new appError('react not found', 404));

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

    like.type = type;
    await like.save();

    res.status(200).json({
      status: 'success',
      data: {
        like,
      },
    });
  },
);
