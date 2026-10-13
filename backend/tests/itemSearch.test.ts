import { describe, expect, test } from 'vitest';
import {
  rankSecurityItemSearch,
  resolveItemSearchThreshold,
  shouldEmbedItemSearchQuery,
  type SecurityItemSearchCandidate,
} from '../src/lib/matching/itemSearch';
import { buildItemSearchText } from '../src/lib/matching/searchText';

function candidate(
  overrides: Partial<SecurityItemSearchCandidate> = {}
): SecurityItemSearchCandidate {
  const item: SecurityItemSearchCandidate = {
    itemId: '550e8400-e29b-41d4-a716-446655440000',
    campus: { campusName: 'Newnham' },
    category: 'Electronics',
    title: 'Portable Charger',
    descriptionPublic: null,
    descriptionInternal: 'Pink power bank with an attached cable',
    brand: 'Belkin',
    color: 'Pink',
    locationFound: 'Library',
    dateFound: new Date('2026-08-11'),
    createdAt: new Date('2026-08-11T12:00:00.000Z'),
    searchText: null,
    embedding: [0.9, 0.1],
    ...overrides,
  };
  item.searchText ??= buildItemSearchText(item);
  return item;
}

describe('rankSecurityItemSearch', () => {
  test('ranks exact matches ahead of semantic matches', () => {
    const exact = candidate({
      itemId: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Light red charger',
      embedding: [0, 1],
    });
    exact.searchText = buildItemSearchText(exact);
    const semantic = candidate();

    const result = rankSecurityItemSearch(
      [semantic, exact],
      'light red',
      [1, 0],
      0.3
    );

    expect(result.map(({ item }) => item.itemId)).toEqual([
      exact.itemId,
      semantic.itemId,
    ]);
    expect(result[0].matchType).toBe('exact');
    expect(result[1].matchType).toBe('semantic');
  });

  test('matches query words across different fields', () => {
    const item = candidate({
      title: 'Water Bottle',
      color: 'Black',
      brand: 'Nike',
      descriptionInternal: 'Matte finish with a screw lid',
    });

    expect(
      rankSecurityItemSearch([item], 'black bottle', null)[0]?.matchType
    ).toBe('exact');
    expect(
      rankSecurityItemSearch([item], '  Nike   BOTTLE ', null)
    ).toHaveLength(1);
  });

  test('requires every query word to match', () => {
    const item = candidate({ title: 'Water Bottle', color: 'Black' });

    expect(rankSecurityItemSearch([item], 'black wallet', null)).toHaveLength(
      0
    );
  });

  test('does not use a stale item embedding', () => {
    const item = candidate({ searchText: 'old text' });

    expect(rankSecurityItemSearch([item], 'light red', [1, 0], 0.3)).toEqual(
      []
    );
  });

  test('falls back to exact matching without a query embedding', () => {
    const item = candidate();

    expect(rankSecurityItemSearch([item], 'pink', null)).toHaveLength(1);
    expect(rankSecurityItemSearch([item], 'light red', null)).toHaveLength(0);
  });
});

describe('shouldEmbedItemSearchQuery', () => {
  test('skips the embedding call for queries shorter than three characters', () => {
    expect(shouldEmbedItemSearchQuery('bl')).toBe(false);
    expect(shouldEmbedItemSearchQuery('  b  ')).toBe(false);
    expect(shouldEmbedItemSearchQuery('bla')).toBe(true);
  });
});

describe('resolveItemSearchThreshold', () => {
  test('accepts values from zero to one and rejects malformed values', () => {
    expect(resolveItemSearchThreshold('0.42')).toBe(0.42);
    expect(resolveItemSearchThreshold('2')).toBe(0.35);
    expect(resolveItemSearchThreshold('not-a-number')).toBe(0.35);
  });
});
