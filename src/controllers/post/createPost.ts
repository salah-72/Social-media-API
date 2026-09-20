import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import Post from '@/models/postModel';
import {
  getVideoThumbnailUrl,
  uploadToCloudinary,
} from '@/utils/cloudinaryUpload';
import { logger } from '@/lib/winston';
import { sendResponse } from '@/utils/sendResponse';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

export const createPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let { content, status, whoCanSee } = req.body;

    const cleanContent = purify.sanitize(content);
    const author = req.currentuser?._id;

    if (!req.currentuser?.public && (whoCanSee === 'public' || !whoCanSee))
      whoCanSee = 'followers';

    const files = req.files as Express.Multer.File[] | undefined;
    let images: { url: string; publicId: string }[] = [];
    let videos: {
      url: string;
      publicId: string;
      duration?: number;
      thumbnailUrl: string;
    }[] = [];

    if (files) {
      const uploads = files.map(async (file) => {
        const isVideo = file.mimetype.startsWith('video');
        const result = await uploadToCloudinary(
          file.buffer,
          isVideo ? 'videos' : 'images',
          isVideo ? 'video' : 'image',
        );
        return { ...result, isVideo };
      });

      const res = await Promise.all(uploads);

      images = res
        .filter((r) => !r.isVideo)
        .map((r) => ({ url: r.secure_url, publicId: r.public_id }));
      videos = res
        .filter((r) => r.isVideo)
        .map((r) => ({
          url: r.secure_url,
          publicId: r.public_id,
          duration: r.duration,
          thumbnailUrl: getVideoThumbnailUrl(r.public_id),
        }));
    }

    const post = await Post.create({
      content: cleanContent,
      author,
      images,
      videos,
      status,
      whoCanSee,
    });

    logger.info(`user: ${author} create post`);

    sendResponse(res, 201, { post });
  },
);
