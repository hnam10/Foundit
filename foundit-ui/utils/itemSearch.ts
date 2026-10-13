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

  // Every word must appear in some field; words may land in different fields.
  return query
    .split(/\s+/)
    .every((word) =>
      searchableItemFields.some((field) =>
        item[field]?.toLowerCase().includes(word)
      )
    );
}
