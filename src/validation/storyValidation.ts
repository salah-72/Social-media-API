import * as z from 'zod';

export const storyValidation = z.object({
  content: z.string().trim().min(1, 'Content is required').optional(),
  whoCanSee: z.enum(['me', 'followers', 'public']).default('public'),
});

export const getStoriesValidation = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1, 'Page must be at least 1')
    .default(1)
    .optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .default(10)
    .optional(),
});

export const getStoryValidation = z.object({
  storyId: z.string().trim().min(1, 'Story ID is required'),
});

export const reactTypeValidation = z.object({
  type: z
    .enum(['like', 'love', 'care', 'sad', 'angry', 'haha', 'wow'])
    .default('like'),
});
