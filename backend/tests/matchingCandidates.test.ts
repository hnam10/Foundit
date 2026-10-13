import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest';
import { ItemStatus } from '@prisma/client';
import {
  buildClaimSearchText,
  buildItemSearchText,
} from '../src/lib/matching/searchText';

vi.mock('../src/db', () => ({
  prisma: {
    claim: { findUnique: vi.fn() },
    item: { findMany: vi.fn() },
  },
}));

vi.mock('../src/lib/matching/ingest', () => ({
  ingestClaimSearchIndex: vi.fn(),
  ingestItemSearchIndex: vi.fn(),
}));

import { prisma } from '../src/db';
import { generateMatchCandidates } from '../src/lib/matching/matching';

const campusId = '550e8400-e29b-41d4-a716-446655440001';

function claimRow(overrides: Record<string, unknown> = {}) {
  const semanticFields = {
    category: 'Wallet',
    itemName: 'Black leather wallet',
    description: 'A black bifold holding several cards',
    additionalInfo: null,
    locationLost: 'Newnham library',
  };

  return {
    claimId: 'claim-1',
    campusId,
    dateLost: new Date('2026-07-10T00:00:00.000Z'),
    ...semanticFields,
    searchText: buildClaimSearchText(semanticFields),
    embedding: [1, 0],
    ...overrides,
  };
}

function itemRow() {
  const semanticFields = {
    category: 'Wallet',
    title: 'Dark bifold card holder',
    descriptionPublic: 'Leather holder with cards',
    descriptionInternal: null,
    brand: null,
    color: 'Black',
    locationFound: 'Newnham library second floor',
  };

  return {
    itemId: 'item-1',
    campusId,
    dateFound: new Date('2026-07-11T00:00:00.000Z'),
    retentionExpiryDate: new Date('2099-08-30T00:00:00.000Z'),
    status: ItemStatus.stored,
    ...semanticFields,
    searchText: buildItemSearchText(semanticFields),
    embedding: [0.98, 0.02],
  };
}

describe('generateMatchCandidates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.claim.findUnique as Mock).mockResolvedValue(claimRow());
    (prisma.item.findMany as Mock).mockResolvedValue([itemRow()]);
  });

  test('uses category and campus as deterministic candidate filters', async () => {
    const result = await generateMatchCandidates('claim-1');

    expect(prisma.item.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: { equals: 'Wallet', mode: 'insensitive' },
          campusId,
        }),
      })
    );
    expect(result.candidates).toEqual([
      expect.objectContaining({
        itemId: 'item-1',
        criteria: 'semantic,category,date,location',
      }),
    ]);
  });

  test('searches every campus when the claim uses the missing-campus sentinel', async () => {
    (prisma.claim.findUnique as Mock).mockResolvedValue(
      claimRow({ campusId: '00000000-0000-0000-0000-000000000000' })
    );

    await generateMatchCandidates('claim-1');

    const query = (prisma.item.findMany as Mock).mock.calls[0][0];
    expect(query.where).not.toHaveProperty('campusId');
    expect(query.where.category).toEqual({
      equals: 'Wallet',
      mode: 'insensitive',
    });
  });
});
