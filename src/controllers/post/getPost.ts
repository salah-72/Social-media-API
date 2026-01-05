import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import Post from '@/models/postModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const getPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;
    const post = await Post.findById(postId).select('-__v').lean();

    if (!post) return next(new appError('post not exist', 404));

    const isOwner = req.currentuser?._id.toString() === post.author.toString();

    if ((post.whoCanSee === 'me' || post.status === 'draft') && !isOwner)
      return next(new appError('post not exist', 404));

    if (!isOwner) {
      const block = await Block.exists({
        $or: [
          { blocker: req.currentuser?._id, blocked: post?.author },
          { blocked: req.currentuser?._id, blocker: post?.author },
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

    res.status(200).json({
      status: 'success',
      data: {
        post,
      },
    });
  },
);
