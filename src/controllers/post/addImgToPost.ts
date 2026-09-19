import Post from '@/models/postModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { uploadToCloudinary } from '@/utils/cloudinaryUpload';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const addImg = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.postId;

    const post = await Post.findById(id);
    if (!post) return next(new appError('post not found', 404));

    if (post.author.toString() !== req.currentuser?._id.toString())
      return next(
        new appError('you have no permission to add image to this post', 401),
      );

    if (!req.file) return next(new appError('no file to add', 400));

    const isVideo = req.file.mimetype.startsWith('video');
    const result = await uploadToCloudinary(
      req.file.buffer,
      isVideo ? 'videos' : 'images',
      isVideo ? 'video' : 'image',
    );

    if (isVideo) {
      post.videos?.push({
        url: result.secure_url,
        publicId: result.public_id,
        duration: result.duration,
      });
    } else {
      post.images?.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }

    await post.save();

    sendResponse(res, 200, undefined, { message: 'image added' });
  },
);
