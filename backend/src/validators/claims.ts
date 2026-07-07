import { ClaimStatus, MatchStatus } from '@prisma/client';
import { z } from 'zod';

const claimStatusValues = [
  ClaimStatus.submitted,
  ClaimStatus.under_review,
  ClaimStatus.approved,
  ClaimStatus.rejected,
  ClaimStatus.picked_up,
] as const;

const matchReviewStatusValues = [
  MatchStatus.confirmed,
  MatchStatus.dismissed,
  MatchStatus.rejected,
] as const;

const optionalDateSchema = z.iso
  .date()
  .transform((value) => new Date(`${value}T00:00:00.000Z`))
  .optional();

const claimNotificationPreferenceValues = [
  'email',
  'phone',
  'email_and_phone',
] as const;

// Same upload key shape as reportImageSchema — both flow through
// POST /api/uploads/presigned-url, which always writes to the `reports/` prefix.
export const claimImageSchema = z.object({
  imageUrl: z
    .string()
    .min(1)
    .max(500)
    .trim()
    .regex(
      /^reports\/[0-9a-f-]+\.(jpe?g|png|webp)$/i,
      'imageUrl must be a valid upload key'
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

export const claimParamsSchema = z.object({
  claimId: z.uuid(),
});

export const claimAndMatchParamsSchema = z.object({
  claimId: z.uuid(),
  matchId: z.uuid(),
});

export const createClaimSchema = z.object({
  category: z.string().min(1).max(50).trim(),
  itemName: z.string().max(100).trim().optional(),
  description: z.string().min(1).max(2000).trim(),
  additionalInfo: z.string().max(2000).trim().optional(),
  notificationPreference: z
    .enum(claimNotificationPreferenceValues)
    .optional(),
  dateLost: optionalDateSchema,
  locationLost: z.string().min(1).max(255).trim().optional(),
  images: z.array(claimImageSchema).max(5).optional().default([]),
});

export const listClaimsQuerySchema = z.object({
  status: z.enum(claimStatusValues).optional(),
  campusId: z.uuid().optional(),
  studentId: z.uuid().optional(),
  itemId: z.uuid().optional(),
  cursor: z.uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const linkClaimItemSchema = z.object({
  itemId: z.uuid(),
});

export const updateClaimStatusSchema = z.object({
  status: z.enum(claimStatusValues),
  rejectionReason: z.string().min(1).max(2000).trim().optional(),
});

export const reviewMatchSuggestionSchema = z.object({
  status: z.enum(matchReviewStatusValues),
});
