import Story from '@/models/storyModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { uploadToCloudinary } from '@/utils/cloudinaryUpload';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const createStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const author = req.currentuser?._id;
    let { content, whoCanSee } = req.body;

    let img: { url: string; publicId: string } | undefined;
    if (req.file) {
      const upload = await uploadToCloudinary(req.file.buffer, 'images');
      img = {
        url: upload.secure_url,
        publicId: upload.public_id,
      };
    }

    if (!content && !img)
      return next(new appError('story must contain content or img', 400));

    if (!req.currentuser?.public && (whoCanSee === 'public' || !whoCanSee))
      whoCanSee = 'followers';

    const story = await Story.create({
      author,
      content,
      img,
      whoCanSee,
    });

    sendResponse(res, 201, undefined, { message: 'story created' });
  },
);
