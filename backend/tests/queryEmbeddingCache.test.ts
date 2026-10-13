import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  clearQueryEmbeddingCache,
  getQueryEmbedding,
} from '../src/lib/matching/queryEmbeddingCache';

describe('query embedding cache', () => {
  beforeEach(() => clearQueryEmbeddingCache());

  test('reuses a normalized query within the cache window', async () => {
    const embed = vi.fn().mockResolvedValue([1, 0]);

    await expect(getQueryEmbedding(' Light Red ', embed, 100)).resolves.toEqual(
      [1, 0]
    );
    await expect(getQueryEmbedding('light red', embed, 200)).resolves.toEqual([
      1, 0,
    ]);

    expect(embed).toHaveBeenCalledTimes(1);
  });

  test('removes failed requests so they can be retried', async () => {
    const embed = vi
      .fn()
      .mockRejectedValueOnce(new Error('temporary failure'))
      .mockResolvedValueOnce([1, 0]);

    await expect(getQueryEmbedding('pink', embed, 100)).rejects.toThrow(
      'temporary failure'
    );
    await expect(getQueryEmbedding('pink', embed, 200)).resolves.toEqual([
      1, 0,
    ]);
    expect(embed).toHaveBeenCalledTimes(2);
  });
});
