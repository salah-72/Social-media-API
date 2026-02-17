import Block from '@/models/blockModel';
import Follow from '@/models/followModel';
import Story from '@/models/storyModel';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

export const isTargetStoryAvailable = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { storyId } = req.params;

    const story = await Story.findById(storyId)
      .select('-__v -updatedAt -viewsCount -likesCount -_id')
      .populate('author', 'username profilePhoto firstName lastName');

    if (!story || story.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000))
      return next(new appError('story not found', 404));

    const authorExist = await User.exists({
      _id: story.author,
      active: true,
    });
    if (!authorExist) return next(new appError('story not found', 404));

    const isOwner = req.currentuser?._id.toString() === story.author.toString();

    if (!isOwner) {
      if (story.whoCanSee === 'me')
        return next(new appError('story not exist', 404));

      const block = await Block.exists({
        $or: [
          { blocker: req.currentuser?._id, blocked: story.author },
          { blocked: req.currentuser?._id, blocker: story.author },
        ],
      });
      if (block) return next(new appError('story not exist', 404));

      const isFollower = await Follow.exists({
        follower: req.currentuser?._id,
        following: story?.author,
        status: 'accepted',
      });

      if (!isFollower && story.whoCanSee === 'followers')
        return next(new appError('story not exist', 404));
    }

    req.story = story;
    next();
  },
);
