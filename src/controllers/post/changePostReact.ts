import Like from '@/models/likeModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const changeReact = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const type = req.body?.type;

    const like = await Like.findOne({
      user: req.currentuser!._id,
      post: postId,
    });
    if (!like) return next(new appError('react not found', 404));

    like.type = type;
    await like.save();

    sendResponse(res, 200, undefined, { message: 'react changed' });
  },
);
