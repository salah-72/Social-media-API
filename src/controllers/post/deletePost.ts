import cloudinary from '@/config/cloudinaryConfig';
import { logger } from '@/lib/winston';
import Post from '@/models/postModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const deletePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const deletedPost = await Post.findById(id);
    if (!deletedPost) return next(new appError('post not found', 404));

    if (req.currentuser?._id.toString() !== deletedPost.author.toString())
      return next(
        new appError('you have no permission to delete this post', 401),
      );

    if (deletedPost.images && deletedPost.images.length > 0) {
      await Promise.all(
        deletedPost.images.map((img) => {
          cloudinary.uploader.destroy(img.publicId);
        }),
      );
    }

    await deletedPost?.deleteOne();

    logger.info(`user: ${req.currentuser?._id} delete post ${id}`);

    res.status(204).json({
      status: 'success',
    });
  },
);
