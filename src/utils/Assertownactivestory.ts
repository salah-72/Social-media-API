import Story from '@/models/storyModel';
import appError from '@/utils/appError';
import { Types } from 'mongoose';

export const assertOwnActiveStory = async (
  storyId: string,
  currentUserId: Types.ObjectId | undefined,
) => {
  const story = await Story.findById(storyId);

  if (
    !story ||
    story.author._id.toString() !== currentUserId?.toString() ||
    story.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000)
  ) {
    throw new appError('story not found', 404);
  }

  return story;
};
