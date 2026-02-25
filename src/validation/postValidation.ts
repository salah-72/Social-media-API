import * as z from 'zod';

export const createPostValidation = z.object({
  content: z.string().trim().min(1, 'Content is required'),
  status: z.enum(['draft', 'published']).optional(),
  whoCanSee: z.enum(['public', 'followers', 'me']).optional(),
});

export const deletePostValidation = z.object({
  id: z.string().trim().min(1, 'Post ID is required'),
});

export const updatePostValidation = z.object({
  id: z.string().trim().min(1, 'Post ID is required'),
  content: z.string().trim().min(1, 'Content is required').optional(),
  status: z.enum(['draft', 'published']).optional(),
  whoCanSee: z.enum(['public', 'followers', 'me']).optional(),
});

export const PostValidation = z.object({
  postId: z.string().trim().min(1, 'Post ID is required'),
});

export const deleteImgFromPostValidation = z.object({
  postId: z.string().trim().min(1, 'Post ID is required'),
  imgId: z.string().trim().min(1, 'Public ID is required'),
});

export const getPostsValidation = z.object({
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

export const getUserPostsValidation = z.object({
  id: z.string().trim().min(1, 'User ID is required'),
});

export const changeTypeValidation = z.object({
  type: z.enum(['like', 'love', 'care', 'sad', 'angry', 'haha', 'wow']),
});

export const getLIkedUsersValidation = z.object({
  postId: z.string().trim().min(1, 'Post ID is required'),
  type: z.enum(['like', 'love', 'care', 'sad', 'angry', 'haha', 'wow']),
});

export const createCommentValidation = z.object({
  content: z.string().trim().min(1, { message: 'Content is required' }),
});

export const createReplyValidation = z.object({
  postId: z.string().trim().min(1, 'Post ID is required'),
  commentId: z.string().trim().min(1, 'Comment ID is required'),
});

export const getLikedUsersOnCommentValidation = z.object({
  postId: z.string().trim().min(1, 'Post ID is required'),
  commentId: z.string().trim().min(1, 'Comment ID is required'),
  type: z.enum(['like', 'love', 'care', 'sad', 'angry', 'haha', 'wow']),
});
