import * as z from 'zod';

export const loginValidation = z.object({
  email: z.string().email({ message: 'invalid email address' }).optional(),
  username: z.string().min(1, { message: 'username is required' }).optional(),
  password: z.string().min(1, { message: 'password is required' }),
});
