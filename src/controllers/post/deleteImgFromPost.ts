import cloudinary from '@/config/cloudinaryConfig';
import Post from '@/models/postModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const deleteImg = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId, imgId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return next(new appError('post not found', 404));

    if (post.author.toString() !== req.currentuser?._id.toString())
      return next(
        new appError(
          'you have no permission to delete image from this post',
          401,
        ),
      );

    const img = post.images?.find((img) => img._id!.toString() === imgId);
    if (!img) return next(new appError('image not found', 404));

    await cloudinary.uploader.destroy(img?.publicId);

    post.images = post.images?.filter(
      (image) => image._id!.toString() !== imgId,
    );

    await post.save();

    res.status(204).json({
      status: 'success',
    });
  },
);
