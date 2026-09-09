import * as z from 'zod';

export const IdParamValidation = z.object({
  id: z.string().min(1, 'ID is required'),
});

export const sendMessageValidation = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Message content cannot be empty')
    .max(2000, 'Message content cannot exceed 2000 characters')
    .optional(),
});

export const getConversationsValidation = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20).optional(),
});

export const searchMessagesValidation = z.object({
  q: z
    .string()
    .trim()
    .min(1, 'search query is required')
    .max(200, 'search query must be at most 200 characters'),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20).optional(),
});

export const createGroupValidation = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Group name is required')
    .max(200, 'Group name must be at most 200 characters'),

  memberIds: z
    .array(z.string().min(1))
    .min(2, 'a group needs at least 2 other members'),
});

export const updateGroupInfoValidation = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Group name is required')
    .max(200, 'Group name must be at most 200 characters')
    .optional(),
});

export const addGroupMemberValidation = z.object({
  memberId: z.string().min(1),
});

export const removeGroupMemberValidation = z.object({
  id: z.string().min(1, 'ID is required'),
  memberId: z.string().min(1),
});
