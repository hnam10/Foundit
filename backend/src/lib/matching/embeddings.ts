const EMBEDDING_DIMENSIONS = 1536;
const OPENROUTER_API_URL =
  process.env.OPENROUTER_API_URL ?? 'https://openrouter.ai/api/v1';
const OPENROUTER_EMBEDDING_MODEL =
  process.env.OPENROUTER_EMBEDDING_MODEL ?? 'openai/text-embedding-3-small';

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(
    vector.reduce((sum, value) => sum + value * value, 0)
  );
  if (magnitude === 0) {
    return vector;
  }
  return vector.map((value) => value / magnitude);
}

/** Deterministic local fallback when OPENROUTER_API_KEY is not configured. */
export function buildLocalEmbedding(text: string): number[] {
  const vector = new Array<number>(EMBEDDING_DIMENSIONS).fill(0);
  const tokens = tokenize(text);

  for (const token of tokens) {
    let hash = 0;
    for (let i = 0; i < token.length; i += 1) {
      hash = (hash * 31 + token.charCodeAt(i)) >>> 0;
    }
    const index = hash % EMBEDDING_DIMENSIONS;
    vector[index] += 1;
  }

  return normalizeVector(vector);
}

async function embedWithOpenRouter(
  text: string,
  apiKey: string
): Promise<number[]> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const referer =
    process.env.APP_URL?.trim() || process.env.FRONTEND_URL?.trim();
  if (referer) {
    headers['HTTP-Referer'] = referer;
    headers['X-Title'] = 'Foundit';
  }

  const response = await fetch(`${OPENROUTER_API_URL}/embeddings`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: OPENROUTER_EMBEDDING_MODEL,
      input: text,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `OpenRouter embedding request failed (${response.status}): ${errorBody}`
    );
  }

  const payload = (await response.json()) as {
    data?: Array<{ embedding?: number[] }>;
  };
  const embedding = payload.data?.[0]?.embedding;

  if (!embedding || embedding.length === 0) {
    throw new Error('OpenRouter embedding response did not include a vector.');
  }

  return normalizeVector(embedding);
}

export async function embedText(text: string): Promise<number[]> {
  const normalized = text.trim();
  if (!normalized) {
    return new Array<number>(EMBEDDING_DIMENSIONS).fill(0);
  }

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (apiKey) {
    return embedWithOpenRouter(normalized, apiKey);
  }

  return buildLocalEmbedding(normalized);
}

export const embeddingDimensions = EMBEDDING_DIMENSIONS;
