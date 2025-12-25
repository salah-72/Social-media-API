import Post from '@/models/postModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { uploadToCloudinary } from '@/utils/cloudinaryUpload';
import { Request, Response, NextFunction } from 'express';

export const addImg = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) return next(new appError('post not found', 404));

    if (post.author.toString() !== req.currentuser?._id.toString())
      return next(
        new appError('you have no permission to add image to this post', 401),
      );

    if (!req.file) return next(new appError('no image to add', 400));

    const img = await uploadToCloudinary(req.file.buffer, 'images');

    post.images?.push({
      url: img.secure_url,
      publicId: img.public_id,
    });

    await post.save();

    res.status(200).json({
      status: 'success',
      post,
    });
  },
);
