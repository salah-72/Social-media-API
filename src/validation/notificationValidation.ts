import * as z from 'zod';

export const getNotificationsValidation = z.object({
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
