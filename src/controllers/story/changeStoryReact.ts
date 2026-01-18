import Like from '@/models/likeModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const changeStoryReact = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { storyId } = req.params;
    const type = req.body?.type;

    const like = await Like.findOne({
      user: req.currentuser!._id,
      story: storyId,
    });
    if (!like || !type) return next(new appError('react not found', 404));

    like.type = type;
    await like.save();

    res.status(200).json({
      status: 'success',
      data: {
        like,
      },
    });
  },
);
