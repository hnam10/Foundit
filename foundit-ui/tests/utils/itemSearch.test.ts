import { describe, expect, test } from 'vitest';
import type { SecurityItemListItem } from '@/types/items';
import { matchesSecurityItemSearch } from '@/utils/itemSearch';

const item: SecurityItemListItem = {
  itemId: '550e8400-e29b-41d4-a716-446655440000',
  campusId: '550e8400-e29b-41d4-a716-446655440001',
  campusName: 'Newnham',
  category: 'Electronics',
  title: 'Portable Charger',
  descriptionPublic: null,
  descriptionInternal: 'Pink',
  dateFound: '2026-08-11',
  createdAt: '2026-08-11T12:00:00.000Z',
  status: 'stored',
  retentionExpiryDate: '2026-09-10',
  imageUrl: null,
};

describe('matchesSecurityItemSearch', () => {
  test('matches internal and public descriptions case-insensitively', () => {
    expect(matchesSecurityItemSearch(item, 'pink')).toBe(true);
    expect(
      matchesSecurityItemSearch(
        { ...item, descriptionPublic: 'Rose coloured power bank' },
        'ROSE'
      )
    ).toBe(true);
  });

  test('keeps existing title, category, id, and campus matching', () => {
    expect(matchesSecurityItemSearch(item, 'charger')).toBe(true);
    expect(matchesSecurityItemSearch(item, 'electronics')).toBe(true);
    expect(matchesSecurityItemSearch(item, '550e8400')).toBe(true);
    expect(matchesSecurityItemSearch(item, 'newnham')).toBe(true);
  });

  test('matches every item for a blank query', () => {
    expect(matchesSecurityItemSearch(item, '   ')).toBe(true);
  });

  test('rejects unrelated text', () => {
    expect(matchesSecurityItemSearch(item, 'wallet')).toBe(false);
  });
});
