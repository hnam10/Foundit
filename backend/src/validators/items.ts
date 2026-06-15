import { ItemStatus } from '@prisma/client';
import { z } from 'zod';

const itemStatusValues = [
  ItemStatus.pending_report,
  ItemStatus.stored,
  ItemStatus.claimed,
  ItemStatus.expired,
  ItemStatus.disposed,
] as const;

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
