import { ClaimStatus, MatchStatus } from '@prisma/client';
import { z } from 'zod';

const claimStatusValues = [
  ClaimStatus.submitted,
  ClaimStatus.approved,
  ClaimStatus.rejected,
  ClaimStatus.picked_up,
  ClaimStatus.under_review,
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

export const claimParamsSchema = z.object({
  claimId: z.uuid(),
});

export const claimAndMatchParamsSchema = z.object({
  claimId: z.uuid(),
  matchId: z.uuid(),
});

export const createClaimSchema = z.object({
  category: z.string().min(1).max(50).trim(),
  description: z.string().min(1).max(2000).trim(),
  dateLost: optionalDateSchema,
  locationLost: z.string().min(1).max(255).trim().optional(),
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
