function tokenize(text: string | null | undefined): Set<string> {
  if (!text) {
    return new Set<string>();
  }

  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .map((token) => token.trim())
      .filter((token) => token.length >= 3)
  );
}

function intersectionSize(left: Set<string>, right: Set<string>): number {
  let count = 0;
  for (const token of left) {
    if (right.has(token)) {
      count += 1;
    }
  }
  return count;
}

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

  if (dateFound < dateLost) {
    return { score: 0, valid: false };
  }

  const diff = daysBetween(dateLost, dateFound);
  if (diff <= 7) return { score: 1, valid: true };
  if (diff <= 30) return { score: 0.7, valid: true };
  if (diff <= 90) return { score: 0.4, valid: true };
  return { score: 0.1, valid: true };
}

export function categoryMatchScore(
  claimCategory: string,
  itemCategory: string
): number {
  return claimCategory.toLowerCase() === itemCategory.toLowerCase() ? 1 : 0;
}

export function campusMatchScore(
  claimCampusId: string,
  itemCampusId: string
): number {
  return claimCampusId === itemCampusId ? 1 : 0.3;
}

export function locationOverlapScore(
  locationLost: string | null,
  locationFound: string | null
): number {
  const claimTokens = tokenize(locationLost);
  const itemTokens = tokenize(locationFound);
  if (claimTokens.size === 0 || itemTokens.size === 0) {
    return 0;
  }
  return intersectionSize(claimTokens, itemTokens) > 0 ? 1 : 0;
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

export interface HybridScoreInput {
  semanticSimilarity: number;
  category: number;
  dateProximity: number;
  campus: number;
  location: number;
  retention: number;
}

export function combineHybridScore(input: HybridScoreInput): number {
  const weighted =
    0.5 * input.semanticSimilarity +
    0.15 * input.category +
    0.15 * input.dateProximity +
    0.1 * input.campus +
    0.05 * input.location +
    0.05 * input.retention;

  return Math.round(Math.max(0, Math.min(1, weighted)) * 100);
}

export function buildMatchCriteria(input: HybridScoreInput): string {
  const criteria: string[] = ['semantic'];

  if (input.category > 0) criteria.push('category');
  if (input.dateProximity >= 0.7) criteria.push('date');
  if (input.campus >= 1) criteria.push('campus');
  if (input.location > 0) criteria.push('location');
  if (input.retention < 1) criteria.push('retention');

  return criteria.join(',');
}
