export function cosineSimilarity(left: number[], right: number[]): number {
  if (left.length === 0 || right.length === 0 || left.length !== right.length) {
    return 0;
  }

  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (let i = 0; i < left.length; i += 1) {
    dot += left[i] * right[i];
    leftMagnitude += left[i] * left[i];
    rightMagnitude += right[i] * right[i];
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

export function daysBetween(left: Date, right: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.abs(Math.round((left.getTime() - right.getTime()) / msPerDay));
}

export function dateProximityScore(
  dateLost: Date | null,
  dateFound: Date
): { score: number; valid: boolean } {
  if (!dateLost) {
    return { score: 0.5, valid: true };
  }

  // Students often misremember lost dates by a day or two. Keep inverted
  // dates in the candidate pool with a low date weight instead of dropping.
  if (dateFound < dateLost) {
    return { score: 0.1, valid: true };
  }

  const diff = daysBetween(dateLost, dateFound);
  if (diff <= 7) return { score: 1, valid: true };
  if (diff <= 30) return { score: 0.7, valid: true };
  if (diff <= 90) return { score: 0.4, valid: true };
  return { score: 0.1, valid: true };
}

export function retentionUrgencyScore(
  retentionExpiryDate: Date | null,
  today: Date
): number {
  if (!retentionExpiryDate) {
    return 1;
  }

  const daysLeft = Math.ceil(
    (retentionExpiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft <= 7) {
    return 0.7;
  }

  return 1;
}

const LOCATION_STOP_WORDS = new Set([
  'at',
  'by',
  'in',
  'near',
  'of',
  'on',
  'the',
]);

function locationTokens(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter((token) => token.length > 1 && !LOCATION_STOP_WORDS.has(token))
  );
}

export interface LocationProximityResult {
  score: number;
  hasEvidence: boolean;
}

/**
 * Deterministic location similarity for the free-text location fields.
 * Missing locations are neutral rather than a reason to reject a candidate.
 */
export function locationProximityScore(
  locationLost: string | null,
  locationFound: string | null
): LocationProximityResult {
  if (!locationLost?.trim() || !locationFound?.trim()) {
    return { score: 0.5, hasEvidence: false };
  }

  const lostTokens = locationTokens(locationLost);
  const foundTokens = locationTokens(locationFound);
  if (lostTokens.size === 0 || foundTokens.size === 0) {
    return { score: 0.5, hasEvidence: false };
  }

  const overlap = [...lostTokens].filter((token) => foundTokens.has(token));
  const union = new Set([...lostTokens, ...foundTokens]);
  return {
    score: overlap.length / union.size,
    hasEvidence: overlap.length > 0,
  };
}

export interface HybridScoreInput {
  semanticSimilarity: number;
  dateProximity: number;
  locationProximity: number;
  locationEvidence: boolean;
  retention: number;
  /** Present only when both claim and item have image embeddings. */
  imageSimilarity?: number | null;
}

const IMAGE_CRITERIA_THRESHOLD = 0.7;

/** Returns a 0–100 match score; image similarity is weighted in only when present. */
export function combineHybridScore(input: HybridScoreInput): number {
  const hasImage =
    typeof input.imageSimilarity === 'number' &&
    Number.isFinite(input.imageSimilarity);

  const weighted = hasImage
    ? 0.55 * input.semanticSimilarity +
      0.15 * (input.imageSimilarity as number) +
      0.15 * input.dateProximity +
      0.1 * input.locationProximity +
      0.05 * input.retention
    : 0.7 * input.semanticSimilarity +
      0.15 * input.dateProximity +
      0.1 * input.locationProximity +
      0.05 * input.retention;

  return Math.round(Math.max(0, Math.min(1, weighted)) * 100);
}

export function buildMatchCriteria(input: HybridScoreInput): string {
  const criteria: string[] = ['semantic', 'category'];

  if (
    typeof input.imageSimilarity === 'number' &&
    input.imageSimilarity >= IMAGE_CRITERIA_THRESHOLD
  ) {
    criteria.push('image');
  }
  if (input.dateProximity >= 0.7) criteria.push('date');
  if (input.locationEvidence) criteria.push('location');
  if (input.retention < 1) criteria.push('retention');

  return criteria.join(',');
}
