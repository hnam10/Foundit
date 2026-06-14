import { z } from 'zod';

export const publicItemsQuerySchema = z.object({
  category: z.string().min(1).max(50).trim().optional(),
  campusId: z.uuid().optional(),
});
