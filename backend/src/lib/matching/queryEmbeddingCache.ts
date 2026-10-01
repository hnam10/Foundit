import { embedText } from './embeddings';

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;

interface CacheEntry {
  expiresAt: number;
  embedding: Promise<number[]>;
}

const cache = new Map<string, CacheEntry>();

export function getQueryEmbedding(
  query: string,
  embed: (text: string) => Promise<number[]> = embedText,
  now = Date.now()
): Promise<number[]> {
  const key = query.trim().toLowerCase();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.embedding;
  }

  if (cached) cache.delete(key);
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value as string | undefined;
    if (oldestKey) cache.delete(oldestKey);
  }

  const embedding = embed(query).catch((error) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, { expiresAt: now + CACHE_TTL_MS, embedding });
  return embedding;
}

export function clearQueryEmbeddingCache(): void {
  cache.clear();
}
