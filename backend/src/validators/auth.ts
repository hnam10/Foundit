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

export const registerSchema = z.object({
  email: z
    .email()
    .toLowerCase()
    .trim()
    .refine((val) => val.endsWith('@myseneca.ca'), {
      message: 'Must be a Seneca email address (@myseneca.ca)',
    }),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit'),
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  role: z.enum(['student', 'security']), // admin role is not available via self-registration
  // campusId is optional — users may self-register without a campus assignment.
  // If omitted, campus_id will be null until assigned later by an admin.
  campusId: z.uuid().optional(),
  phone: z
    .string()
    .regex(/^\d{10}$/)
    .optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});
