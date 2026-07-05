import { z } from 'zod';
import { reportImageSchema, reportLinkTokenParamsSchema } from './reportLinks';

export const photoSessionTokenParamsSchema = reportLinkTokenParamsSchema;

export const createPhotoSessionSchema = z.object({
  expiresInMinutes: z.coerce.number().int().min(5).max(1440).default(30),
});

export type CreatePhotoSessionInput = z.infer<typeof createPhotoSessionSchema>;

export const photoSessionPresignSchema = z
  .object({
    fileName: z.string().min(1).max(255).trim(),
    contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
    fileSizeKb: z.coerce
      .number()
      .int()
      .min(1)
      .max(5 * 1024),
    fileSizeBytes: z.coerce
      .number()
      .int()
      .min(1)
      .max(5 * 1024 * 1024),
  })
  .refine((data) => data.fileSizeKb === Math.ceil(data.fileSizeBytes / 1024), {
    message: 'fileSizeKb must match fileSizeBytes',
    path: ['fileSizeKb'],
  });

export const registerPhotoSessionImageSchema = reportImageSchema;

export type RegisterPhotoSessionImageInput = z.infer<
  typeof registerPhotoSessionImageSchema
>;
