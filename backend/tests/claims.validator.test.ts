import { describe, expect, test } from 'vitest';
import {
  claimParamsSchema,
  createClaimSchema,
  listClaimsQuerySchema,
  linkClaimItemSchema,
  updateClaimStatusSchema,
  reviewMatchSuggestionSchema,
} from '../src/validators/claims';

const uuid = '550e8400-e29b-41d4-a716-446655440000';

describe('claims validators', () => {
  test('accepts valid claim id params', () => {
    const result = claimParamsSchema.safeParse({ claimId: uuid });

    expect(result.success).toBe(true);
  });

  test('rejects invalid claim id params', () => {
    const result = claimParamsSchema.safeParse({ claimId: 'abc' });

    expect(result.success).toBe(false);
  });

  test('accepts valid create claim body', () => {
    const result = createClaimSchema.safeParse({
      category: 'Electronics',
      description: 'Lost my iPhone',
      dateLost: '2026-07-01',
      locationLost: 'Library',
    });

    expect(result.success).toBe(true);
  });

  test('rejects empty description', () => {
    const result = createClaimSchema.safeParse({
      category: 'Electronics',
      description: '',
    });

    expect(result.success).toBe(false);
  });

  test('uses default limit for list claims query', () => {
    const result = listClaimsQuerySchema.safeParse({});

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.limit).toBe(20);
    }
  });

  test('rejects limit over 50', () => {
    const result = listClaimsQuerySchema.safeParse({
      limit: 100,
    });

    expect(result.success).toBe(false);
  });

  test('accepts valid item id when linking claim to item', () => {
    const result = linkClaimItemSchema.safeParse({
      itemId: uuid,
    });

    expect(result.success).toBe(true);
  });

  test('accepts valid claim status update', () => {
    const result = updateClaimStatusSchema.safeParse({
      status: 'approved',
    });

    expect(result.success).toBe(true);
  });

  test('rejects invalid claim status', () => {
    const result = updateClaimStatusSchema.safeParse({
      status: 'waiting',
    });

    expect(result.success).toBe(false);
  });

  test('accepts valid match review status', () => {
    const result = reviewMatchSuggestionSchema.safeParse({
      status: 'confirmed',
    });

    expect(result.success).toBe(true);
  });
});