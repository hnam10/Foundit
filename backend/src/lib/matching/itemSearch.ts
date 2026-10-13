import { Prisma } from '@prisma/client';
import { buildItemSearchText, type ItemSearchInput } from './searchText';
import { cosineSimilarity } from './scores';
import { parseEmbedding } from './embeddingValue';

export const DEFAULT_ITEM_SEARCH_THRESHOLD = 0.35;
const MIN_SEMANTIC_QUERY_LENGTH = 3;

/**
 * Queries typed one letter at a time would each pay for an embedding that
 * carries no meaning yet; below this length only exact matching runs.
 */
export function shouldEmbedItemSearchQuery(query: string): boolean {
  return query.trim().length >= MIN_SEMANTIC_QUERY_LENGTH;
}

export interface SecurityItemSearchCandidate extends ItemSearchInput {
  itemId: string;
  campus: { campusName: string };
  dateFound: Date;
  createdAt: Date;
  searchText: string | null;
  embedding: Prisma.JsonValue | null;
}

export interface RankedSecurityItem<T extends SecurityItemSearchCandidate> {
  item: T;
  score: number;
  matchType: 'exact' | 'semantic';
}

export function resolveItemSearchThreshold(
  raw = process.env.ITEM_SEARCH_SEMANTIC_THRESHOLD
): number {
  if (!raw?.trim()) return DEFAULT_ITEM_SEARCH_THRESHOLD;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1
    ? parsed
    : DEFAULT_ITEM_SEARCH_THRESHOLD;
}

/**
 * Every query word must appear in some field, but the words may land in
 * different fields: "black bottle" matches color "Black" + title "Water Bottle".
 */
function hasExactMatch(
  item: SecurityItemSearchCandidate,
  normalizedQuery: string
): boolean {
  const fields = [
    item.itemId,
    item.title,
    item.category,
    item.campus.campusName,
    item.brand,
    item.color,
    item.descriptionPublic,
    item.descriptionInternal,
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.toLowerCase());

  return normalizedQuery
    .split(/\s+/)
    .every((word) => fields.some((field) => field.includes(word)));
}

/** Ranks exact matches first, then semantic matches at or above the threshold. */
export function rankSecurityItemSearch<T extends SecurityItemSearchCandidate>(
  items: readonly T[],
  query: string,
  queryEmbedding: number[] | null,
  threshold = resolveItemSearchThreshold()
): RankedSecurityItem<T>[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  const ranked: RankedSecurityItem<T>[] = [];

  for (const item of items) {
    if (hasExactMatch(item, normalizedQuery)) {
      ranked.push({ item, score: 1, matchType: 'exact' });
      continue;
    }

    const itemEmbedding = parseEmbedding(item.embedding);
    const embeddingIsCurrent = item.searchText === buildItemSearchText(item);
    if (!queryEmbedding || !itemEmbedding || !embeddingIsCurrent) {
      continue;
    }

    const score = cosineSimilarity(queryEmbedding, itemEmbedding);
    if (score >= threshold) {
      ranked.push({ item, score, matchType: 'semantic' });
    }
  }

  return ranked.sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    const dateDifference =
      right.item.dateFound.getTime() - left.item.dateFound.getTime();
    if (dateDifference !== 0) return dateDifference;
    const createdDifference =
      right.item.createdAt.getTime() - left.item.createdAt.getTime();
    if (createdDifference !== 0) return createdDifference;
    return right.item.itemId.localeCompare(left.item.itemId);
  });
}
