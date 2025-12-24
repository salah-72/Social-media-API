import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import Post from '@/models/postModel';
import { uploadToCloudinary } from '@/utils/cloudinaryUpload';
import appError from '@/utils/appError';
import { logger } from '@/lib/winston';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export const createPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { content, status, whoCanSee } = req.body;
    if (!content) return next(new appError('content is required', 400));

    const cleanContent = purify.sanitize(content);
    const author = req.currentuser?._id;

    const files = req.files as Express.Multer.File[] | undefined;
    let images: { url: string; publicId: string }[] = [];

    if (files) {
      const uploads = files.map((img) => {
        return uploadToCloudinary(img.buffer, 'images');
      });

      const res = await Promise.all(uploads);

      images = res.map((e) => ({
        url: e.secure_url,
        publicId: e.public_id,
      }));
    }

    const post = await Post.create({
      content: cleanContent,
      author,
      images,
      status,
      whoCanSee,
    });

    logger.info(`user: ${author} create post`);

    res.status(201).json({
      status: 'success',
      post,
    });
  },
);
