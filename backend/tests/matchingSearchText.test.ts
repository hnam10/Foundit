import { describe, expect, test } from 'vitest';
import {
  buildClaimSearchText,
  buildItemSearchText,
} from '../src/lib/matching/searchText';

describe('matching search text', () => {
  test('embeds claim descriptions without deterministic fields', () => {
    const text = buildClaimSearchText({
      category: 'Wallet',
      itemName: 'Leather wallet',
      description: 'Black bifold with three cards',
      additionalInfo: 'Initials inside',
      locationLost: 'Newnham library',
    });

    expect(text).toBe(
      'name:Leather wallet | desc:Black bifold with three cards | info:Initials inside'
    );
    expect(text).not.toContain('Wallet');
    expect(text).not.toContain('Newnham library');
  });

  test('embeds item identity and description without location or category', () => {
    const text = buildItemSearchText({
      category: 'Wallet',
      title: 'Dark card holder',
      brand: 'Fossil',
      color: 'Black',
      descriptionPublic: 'Leather bifold',
      descriptionInternal: 'Stored in cabinet',
      locationFound: 'Newnham library',
    });

    expect(text).toBe(
      'title:Dark card holder | brand:Fossil | color:Black | desc:Leather bifold'
    );
    expect(text).not.toContain('Wallet');
    expect(text).not.toContain('Newnham library');
    expect(text).not.toContain('Stored in cabinet');
  });
});
