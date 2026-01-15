import cloudinary from '@/config/cloudinaryConfig';
import Story from '@/models/storyModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const deleteStory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { storyId } = req.params;

    const story = await Story.findById(storyId);
    if (!story) return next(new appError('story not found', 404));
    if (req.currentuser?._id.toString() !== story.author.toString())
      return next(
        new appError('you have no permission to delete this story', 401),
      );

    if (story.img?.publicId)
      await cloudinary.uploader.destroy(story.img?.publicId);

    // TODO: delete views
    // TODO: delete expired stories images from cloudinary

    await story.deleteOne();

    res.status(204).json({
      status: 'success',
    });
  },
);
