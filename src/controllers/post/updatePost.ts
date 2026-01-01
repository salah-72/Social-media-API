import { logger } from '@/lib/winston';
import Post from '@/models/postModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const updatePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) return next(new appError('post not found', 404));

    if (post.author.toString() !== req.currentuser?._id.toString())
      return next(
        new appError('you have no permission to update this post', 401),
      );

    if (req.body.status === 'draft' && post.status === 'published')
      return next(new appError('post can not be draft after publishing', 400));

    if (req.body.status === 'published' && post.status === 'draft') {
      post.status = 'published';
      post.publishedAt = new Date();
    }

    if (req.body.content !== undefined) post.content = req.body.content;

    if (req.body.whoCanSee !== undefined) post.whoCanSee = req.body.whoCanSee;

    if (!req.currentuser?.public && post.whoCanSee === 'public')
      post.whoCanSee = 'followers';

    await post.save();

    logger.info(`user: ${req.currentuser?._id} update post ${id}`);

    res.status(200).json({
      status: 'success',
      post,
    });
  },
);
