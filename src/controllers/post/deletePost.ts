import cloudinary from '@/config/cloudinaryConfig';
import { canModerate } from '@/functions/role';
import { logger } from '@/lib/winston';
import { sendNotification } from '@/utils/sendNotification';
import Like from '@/models/likeModel';
import Post from '@/models/postModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const deletePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    const deletedPost = await Post.findById(id);
    if (!deletedPost) return next(new appError('post not found', 404));

    const isOwner =
      req.currentuser?._id.toString() === deletedPost.author.toString();
    const isAdmin = canModerate(req.currentuser?.role);

    if (!isOwner && !isAdmin)
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

    Like.deleteMany({ post: id });

    await deletedPost?.deleteOne();

    if (isAdmin && !isOwner) {
      logger.info(
        `admin: ${req.currentuser?._id} removed post ${id} belonging to ${deletedPost.author}`,
      );

      try {
        await sendNotification({
          recipient: deletedPost.author,
          sender: req.currentuser!._id,
          type: 'post_removed',
          post: id,
        });
      } catch (err) {
        logger.error('failed to send post_removed notification', {
          postId: id,
          recipient: deletedPost.author,
          err,
        });
      }
    } else {
      logger.info(`user: ${req.currentuser?._id} delete post ${id}`);
    }

    res.status(204).send();
  },
);
