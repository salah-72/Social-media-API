import { incrementLike, decrementLike } from '@/functions/likeCounter';
import Like from '@/models/likeModel';
import Post from '@/models/postModel';
import catchAsync from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response } from 'express';

export const likePost = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const type = req.body?.type || 'like';
  const post = await Post.findById(postId);

  try {
    const like = await Like.create({
      user: req.currentuser?._id,
      post: postId,
      type,
    });

    await incrementLike('post', postId);

    return sendResponse(res, 201, undefined, { message: 'post liked' });
  } catch (err: any) {
    if (err.code === 11000) {
      await Like.deleteOne({ user: req.currentuser?._id, post: postId });

      await decrementLike('post', postId);

      return res.status(204).send();
    }
    throw err;
  }
});
