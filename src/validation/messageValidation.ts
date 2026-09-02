import * as z from 'zod';

export const userIdParamValidation = z.object({
  id: z.string().min(1, 'user id is required'),
});

export const sendMessageValidation = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Message content cannot be empty')
    .max(2000, 'Message content cannot exceed 2000 characters')
    .optional(),
});
