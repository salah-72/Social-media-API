import * as z from 'zod';

export const getUsersValidation = z.object({
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

export const updateProfileValidation = z.object({
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  public: z.boolean().optional(),
  about: z.string().optional(),
  hometown: z.string().optional(),
  currentCity: z.string().optional(),
  education: z
    .array(
      z.object({
        level: z.string(),
        schoolName: z.string(),
      }),
    )
    .optional(),
  experience: z
    .array(
      z.object({
        title: z.string(),
        company: z.string(),
        from: z.coerce.date(),
        to: z.coerce.date(),
      }),
    )
    .optional(),
  gender: z.enum(['Male', 'Female']).optional(),
  birthday: z.coerce.date().optional(),
  socialLinks: z
    .object({
      website: z.string().optional(),
      facebook: z.string().optional(),
      instagtam: z.string().optional(),
      linkedIn: z.string().optional(),
      x: z.string().optional(),
      youtube: z.string().optional(),
    })
    .optional(),
});

export const searchUsersValidation = z.object({
  query: z.string().min(1, 'Search query cannot be empty'),
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

export const userIdValidation = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export const usernameValidation = z.object({
  username: z.string().min(1, 'Username is required'),
});

export const usersValidation = z.object({
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
