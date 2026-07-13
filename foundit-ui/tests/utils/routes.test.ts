import { describe, expect, it } from 'vitest';
import { parseRole, ROLE_HOME, ROLES } from '@/utils/routes';

describe('parseRole', () => {
  it('accepts every known role', () => {
    for (const role of ROLES) {
      expect(parseRole(role)).toBe(role);
    }
  });

  it('rejects unknown or missing values', () => {
    expect(parseRole('superadmin')).toBeNull();
    expect(parseRole('')).toBeNull();
    expect(parseRole(undefined)).toBeNull();
    expect(parseRole(null)).toBeNull();
  });
});

describe('ROLE_HOME', () => {
  it('maps every role to a dashboard path', () => {
    for (const role of ROLES) {
      expect(ROLE_HOME[role]).toMatch(/^\/.+\/dashboard$/);
    }
  });
});
