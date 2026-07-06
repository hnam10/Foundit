import { beforeEach, describe, expect, test } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  hashTokenForStorage,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../src/utils/token';

describe('token utils', () => {
  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  });

  test('signs an access token with user payload', () => {
    const token = signAccessToken({
      user_id: 'user-1',
      role: 'student',
      campus_id: null,
      email: 'student@myseneca.ca',
    });

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!
    ) as jwt.JwtPayload;

    expect(decoded.user_id).toBe('user-1');
    expect(decoded.role).toBe('student');
    expect(decoded.email).toBe('student@myseneca.ca');
  });

  test('signs and verifies refresh token', () => {
    const token = signRefreshToken('user-1');

    const decoded = verifyRefreshToken(token);

    expect(decoded.userId).toBe('user-1');
  });

  test('hashes token for storage', () => {
    const hash = hashTokenForStorage('raw-token');

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  test('same token creates same hash', () => {
    const hash1 = hashTokenForStorage('raw-token');
    const hash2 = hashTokenForStorage('raw-token');

    expect(hash1).toBe(hash2);
  });
});