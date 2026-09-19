import type { SecurityItemListItem } from '@/types/items';

const searchableItemFields = [
  'title',
  'category',
  'itemId',
  'campusName',
  'descriptionPublic',
  'descriptionInternal',
] as const satisfies ReadonlyArray<keyof SecurityItemListItem>;

export function matchesSecurityItemSearch(
  item: SecurityItemListItem,
  searchQuery: string
): boolean {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return true;

  return searchableItemFields.some((field) =>
    item[field]?.toLowerCase().includes(query)
  );
}
