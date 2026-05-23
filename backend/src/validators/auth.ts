import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .email()
    .toLowerCase()
    .trim()
    .refine((val) => val.endsWith('@myseneca.ca'), {
      message: 'Must be a Seneca email address (@myseneca.ca)',
    }),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});
