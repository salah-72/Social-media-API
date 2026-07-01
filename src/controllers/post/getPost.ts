import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import Post from '@/models/postModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { mergeLikesCount } from '@/functions/mergeLikesCount';
import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '@/utils/sendResponse';

export const getPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;
    const post = await Post.findById(postId)
      .select('-__v')
      .populate('author', 'username profilePhoto firstName lastName')
      .lean();

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

    // const pendingLikesCount = await redisClient.get(`likes:post:${post._id}`);
    // const result = {
    //   ...post,
    //   likesCount: post.likesCount + Number(pendingLikesCount || 0),
    // };

    const [result] = await mergeLikesCount([post], 'post');

    sendResponse(res, 200, { post: result });
  },
);
