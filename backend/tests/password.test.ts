import { describe, expect, test } from 'vitest';
import { comparePassword, hashPassword } from '../src/utils/password';

describe('password utils', () => {
  test('hashes a password', async () => {
    const hash = await hashPassword('Password123');

    expect(hash).not.toBe('Password123');
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  test('returns true for correct password', async () => {
    const hash = await hashPassword('Password123');

    const result = await comparePassword('Password123', hash);

    expect(result).toBe(true);
  });

  test('returns false for wrong password', async () => {
    const hash = await hashPassword('Password123');

    const result = await comparePassword('WrongPassword', hash);

    expect(result).toBe(false);
  });
});
