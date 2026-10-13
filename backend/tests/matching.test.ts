import { describe, expect, test, vi, afterEach } from 'vitest';
import { ItemStatus } from '@prisma/client';
import {
  buildMatchCriteria,
  combineHybridScore,
  cosineSimilarity,
  dateProximityScore,
  locationProximityScore,
} from '../src/lib/matching/scores';

describe('matching scores', () => {
  test('cosineSimilarity returns 1 for identical vectors', () => {
    const vector = [0.2, 0.5, 0.9];
    expect(cosineSimilarity(vector, vector)).toBeCloseTo(1, 5);
  });

  test('dateProximityScore treats missing dateLost as neutral', () => {
    const result = dateProximityScore(
      null,
      new Date('2026-07-01T00:00:00.000Z')
    );
    expect(result).toEqual({ score: 0.5, valid: true });
  });

  test('dateProximityScore keeps found-before-lost dates with a low score', () => {
    const result = dateProximityScore(
      new Date('2026-07-10T00:00:00.000Z'),
      new Date('2026-07-01T00:00:00.000Z')
    );
    expect(result).toEqual({ score: 0.1, valid: true });
  });

  test('locationProximityScore uses deterministic token overlap', () => {
    const result = locationProximityScore(
      'Near the Newnham library',
      'Newnham library second floor'
    );
    expect(result.score).toBeCloseTo(0.5, 5);
    expect(result.hasEvidence).toBe(true);
  });

  test('locationProximityScore treats a missing location as neutral', () => {
    expect(locationProximityScore(null, 'Newnham library')).toEqual({
      score: 0.5,
      hasEvidence: false,
    });
  });

  test('combineHybridScore returns a 0-100 score', () => {
    const score = combineHybridScore({
      semanticSimilarity: 0.9,
      dateProximity: 1,
      locationProximity: 1,
      locationEvidence: true,
      retention: 1,
    });

    expect(score).toBeGreaterThanOrEqual(90);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('combineHybridScore is driven mainly by semantic similarity', () => {
    const strongSemantic = combineHybridScore({
      semanticSimilarity: 0.85,
      dateProximity: 0.4,
      locationProximity: 0.5,
      locationEvidence: false,
      retention: 1,
    });
    const weakSemantic = combineHybridScore({
      semanticSimilarity: 0.4,
      dateProximity: 1,
      locationProximity: 0.5,
      locationEvidence: false,
      retention: 1,
    });

    expect(strongSemantic).toBeGreaterThan(weakSemantic);
    expect(weakSemantic).toBeLessThan(55);
  });
  test('buildMatchCriteria only reports location when evidence exists', () => {
    expect(
      buildMatchCriteria({
        semanticSimilarity: 0.85,
        dateProximity: 1,
        locationProximity: 0.5,
        locationEvidence: false,
        retention: 1,
      })
    ).toBe('semantic,category,date');
  });

  test('combineHybridScore without imageSimilarity keeps text-only weights', () => {
    const withoutImage = combineHybridScore({
      semanticSimilarity: 1,
      dateProximity: 0,
      locationProximity: 0,
      locationEvidence: false,
      retention: 0,
    });
    const withNullImage = combineHybridScore({
      semanticSimilarity: 1,
      dateProximity: 0,
      locationProximity: 0,
      locationEvidence: false,
      retention: 0,
      imageSimilarity: null,
    });

    // 0.7 * 1 = 0.7 → 70
    expect(withoutImage).toBe(70);
    expect(withNullImage).toBe(70);
  });

  test('combineHybridScore blends imageSimilarity when present', () => {
    const withImage = combineHybridScore({
      semanticSimilarity: 1,
      dateProximity: 0,
      locationProximity: 0,
      locationEvidence: false,
      retention: 0,
      imageSimilarity: 1,
    });

    // 0.55 * 1 + 0.15 * 1 = 0.7 → 70
    expect(withImage).toBe(70);

    const weakTextStrongImage = combineHybridScore({
      semanticSimilarity: 0.4,
      dateProximity: 1,
      locationProximity: 0,
      locationEvidence: false,
      retention: 1,
      imageSimilarity: 1,
    });
    const weakTextNoImage = combineHybridScore({
      semanticSimilarity: 0.4,
      dateProximity: 1,
      locationProximity: 0,
      locationEvidence: false,
      retention: 1,
    });

    expect(weakTextStrongImage).toBeGreaterThan(weakTextNoImage);
  });

  test('buildMatchCriteria includes image when similarity is high', () => {
    expect(
      buildMatchCriteria({
        semanticSimilarity: 0.9,
        dateProximity: 0.4,
        locationProximity: 0.5,
        locationEvidence: false,
        retention: 1,
        imageSimilarity: 0.75,
      })
    ).toBe('semantic,category,image');

    expect(
      buildMatchCriteria({
        semanticSimilarity: 0.9,
        dateProximity: 0.4,
        locationProximity: 0.5,
        locationEvidence: false,
        retention: 1,
        imageSimilarity: 0.5,
      })
    ).toBe('semantic,category');
  });
});
