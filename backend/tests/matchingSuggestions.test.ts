import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ClaimStatus } from '@prisma/client';
import { MISSING_CAMPUS_ID } from '../src/constants/campus';

vi.mock('../src/db', () => ({
  prisma: {
    claim: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../src/lib/matching/matching', () => ({
  generateMatchCandidates: vi.fn(),
}));

import { prisma } from '../src/db';
import { refreshPendingClaimsForCampus } from '../src/lib/matching/suggestions';

describe('refreshPendingClaimsForCampus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.claim.findMany).mockResolvedValue([]);
  });

  test('refreshes only same-campus and missing-campus claims', async () => {
    const campusId = '550e8400-e29b-41d4-a716-446655440001';

    await refreshPendingClaimsForCampus(campusId);

    expect(prisma.claim.findMany).toHaveBeenCalledWith({
      where: {
        itemId: null,
        status: {
          in: [ClaimStatus.submitted, ClaimStatus.under_review],
        },
        campusId: { in: [campusId, MISSING_CAMPUS_ID] },
      },
      select: { claimId: true },
    });
  });
});
