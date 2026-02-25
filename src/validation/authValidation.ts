import * as z from 'zod';

const passwordValidation = z
  .string()
  .min(6, { message: 'password must be at least 6 characters' })
  .max(100, { message: 'password must be at most 100 characters' })
  .regex(/[A-Z]/, {
    message: 'password must contain at least one uppercase letter',
  })
  .regex(/[a-z]/, {
    message: 'password must contain at least one lowercase letter',
  })
  .regex(/[0-9]/, { message: 'password must contain at least one number' })
  .regex(/[^A-Za-z0-9]/, {
    message: 'password must contain at least one special character',
  });

export const registerValidation = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: 'invalid email address' }),
  firstName: z.string().trim().min(1, { message: 'first name is required' }),
  lastName: z.string().trim().min(1, { message: 'last name is required' }),
  password: passwordValidation,
});

export const loginValidation = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: 'invalid email address' })
      .optional(),
    username: z.string().min(1, { message: 'username is required' }).optional(),
    password: z.string().min(1, { message: 'password is required' }),
  })
  .refine((data) => data.email || data.username, {
    message: 'either email or username must be provided',
    path: ['email', 'username'],
  });

export const tokenValidation = z.object({
  token: z.string().min(1, { message: 'token is required' }),
});

export const forgotPasswordValidation = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: 'invalid email address' })
      .optional(),
    username: z.string().min(1, { message: 'username is required' }).optional(),
  })
  .refine((data) => data.email || data.username, {
    message: 'either email or username must be provided',
    path: ['email', 'username'],
  });

export const updatePasswordValidation = z
  .object({
    oldPassword: z.string().min(1, { message: 'old password is required' }),
    newPassword: passwordValidation,
    confirmPassword: passwordValidation,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'passwords do not match',
    path: ['confirmPassword'],
  });
