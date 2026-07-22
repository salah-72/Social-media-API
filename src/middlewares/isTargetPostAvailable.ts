import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import Post from '@/models/postModel';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const isTargetPostAvailable = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post || post.status === 'draft')
      return next(new appError('post not found', 404));

    const authorExist = await User.exists({
      _id: post.author,
      active: true,
    });
    if (!authorExist) return next(new appError('post not found', 404));

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

    req.post = post;
    next();
  },
);
