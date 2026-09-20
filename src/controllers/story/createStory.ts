import Story from '@/models/storyModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import {
  getVideoThumbnailUrl,
  uploadToCloudinary,
} from '@/utils/cloudinaryUpload';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const createStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const author = req.currentuser?._id;
    let { content, whoCanSee } = req.body;

    let img: { url: string; publicId: string } | undefined;
    let video:
      | {
          url: string;
          publicId: string;
          duration?: number;
          thumbnailUrl?: string;
        }
      | undefined;

    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video');
      const result = await uploadToCloudinary(
        req.file.buffer,
        isVideo ? 'videos' : 'images',
        isVideo ? 'video' : 'image',
      );

      if (isVideo) {
        video = {
          url: result.secure_url,
          publicId: result.public_id,
          duration: result.duration,
          thumbnailUrl: getVideoThumbnailUrl(result.public_id),
        };
      } else {
        img = { url: result.secure_url, publicId: result.public_id };
      }
    }

    if (!content && !img && !video)
      return next(
        new appError('story must contain content, an image, or a video', 400),
      );

    if (!req.currentuser?.public && (whoCanSee === 'public' || !whoCanSee))
      whoCanSee = 'followers';

    const story = await Story.create({
      author,
      content,
      img,
      video,
      whoCanSee,
    });

    sendResponse(res, 201, { story });
  },
);
