import { z } from 'zod';

const categorySchema = z.string().min(1).max(50).trim();
const locationSchema = z.string().min(1).max(100).trim();

function getTodayAtMidnight() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

export const reportLinkTokenParamsSchema = z.object({
  token: z.string().min(1).max(255).trim(),
});

export const createReportLinkSchema = z.object({
  campusId: z.uuid().optional(),
  expiresInMinutes: z.coerce.number().int().min(5).max(1440).default(30),
});

export type CreateReportLinkInput = z.infer<typeof createReportLinkSchema>;

export const reportImageSchema = z.object({
  imageUrl: z
    .string()
    .min(1)
    .max(500)
    .trim()
    .regex(
      /^reports\/[0-9a-f-]+\.(jpe?g|png|webp)$/i,
      'imageUrl must be a valid report upload key'
    ),
  fileType: z
    .string()
    .min(1)
    .max(10)
    .trim()
    .regex(/^(jpe?g|png|webp)$/i),
  fileSizeKb: z.coerce
    .number()
    .int()
    .min(1)
    .max(5 * 1024),
});

export const submitFoundItemReportSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  description: z.string().min(1).max(1000).trim(),
  category: categorySchema,
  locationFound: locationSchema,
  dateFound: z.iso
    .date()
    .transform((value) => new Date(`${value}T00:00:00.000Z`))
    .refine((value) => value <= getTodayAtMidnight(), {
      message: 'dateFound cannot be in the future',
    }),
  timeFound: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'timeFound must use HH:mm format')
    .optional(),
  additionalNotes: z.string().max(2000).trim().optional(),
  images: z.array(reportImageSchema).max(10).optional().default([]),
});

export type SubmitFoundItemReportInput = z.infer<
  typeof submitFoundItemReportSchema
>;
