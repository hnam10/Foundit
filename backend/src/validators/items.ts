import { ItemStatus } from '@prisma/client';
import { z } from 'zod';

const itemStatusValues = [
  ItemStatus.pending_report,
  ItemStatus.stored,
  ItemStatus.claimed,
  ItemStatus.expired,
  ItemStatus.disposed,
] as const;

function getTodayAtMidnight() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export const publicItemsQuerySchema = z.object({
  category: z.string().min(1).max(50).trim().optional(),
  campusId: z.uuid().optional(),
});

export const listSecurityItemsQuerySchema = z.object({
  status: z.enum(itemStatusValues).optional(),
  campusId: z.uuid().optional(),
  category: z.string().min(1).max(50).trim().optional(),
  cursor: z.uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const itemParamsSchema = z.object({
  itemId: z.uuid(),
});

export const updateSecurityItemSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  category: z.string().min(1).max(50).trim(),
  dateFound: z.iso
    .date()
    .transform((value) => new Date(`${value}T00:00:00.000Z`))
    .refine((value) => value <= getTodayAtMidnight(), {
      message: 'dateFound cannot be in the future',
    }),
  locationFound: z
    .string()
    .max(255)
    .trim()
    .transform((value) => value || null)
    .nullable(),
  descriptionInternal: z
    .string()
    .max(5000)
    .trim()
    .transform((value) => value || null)
    .nullable(),
});

export type UpdateSecurityItemInput = z.infer<typeof updateSecurityItemSchema>;
