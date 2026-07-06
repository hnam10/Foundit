import { describe, expect, test } from 'vitest';
import { loginSchema, registerSchema } from '../src/validators/auth';

describe('auth validators', () => {
  test('accepts valid Seneca login email', () => {
    const result = loginSchema.safeParse({
      email: 'student@myseneca.ca',
      password: 'Password123',
    });

    expect(result.success).toBe(true);
  });

  test('rejects non-Seneca email', () => {
    const result = loginSchema.safeParse({
      email: 'student@gmail.com',
      password: 'Password123',
    });

    expect(result.success).toBe(false);
  });

  test('rejects weak registration password', () => {
    const result = registerSchema.safeParse({
      email: 'student@myseneca.ca',
      password: 'password',
      firstName: 'Casey',
      lastName: 'Hsu',
    });

    expect(result.success).toBe(false);
  });
});