import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearAuthSession,
  getAccessToken,
  getLoggedInDisplayName,
  getLoggedInUser,
  getRefreshToken,
  getSessionRole,
  sanitizeRedirect,
  setSessionRole,
  setTokens,
} from '@/utils/auth';

function clearCookies() {
  for (const cookie of document.cookie.split('; ')) {
    const name = cookie.split('=')[0];
    if (name) {
      document.cookie = `${name}=; max-age=0; path=/`;
    }
  }
}

beforeEach(() => {
  localStorage.clear();
  clearCookies();
});

describe('sanitizeRedirect', () => {
  it('allows same-origin relative paths', () => {
    expect(sanitizeRedirect('/student/dashboard')).toBe('/student/dashboard');
    expect(sanitizeRedirect('/profile?tab=notifications')).toBe(
      '/profile?tab=notifications'
    );
  });

  it('rejects open-redirect attempts', () => {
    expect(sanitizeRedirect('//evil.example')).toBeNull();
    expect(sanitizeRedirect('https://evil.example')).toBeNull();
    expect(sanitizeRedirect('javascript:alert(1)')).toBeNull();
    expect(sanitizeRedirect('/ok/..:still-has-colon')).toBeNull();
    expect(sanitizeRedirect('relative/path')).toBeNull();
  });

  it('rejects empty input', () => {
    expect(sanitizeRedirect('')).toBeNull();
    expect(sanitizeRedirect(null)).toBeNull();
    expect(sanitizeRedirect(undefined)).toBeNull();
  });
});

describe('session role cookie', () => {
  it('round-trips a role', () => {
    setSessionRole('student');
    expect(getSessionRole()).toBe('student');
  });

  it('returns null when no cookie is set', () => {
    expect(getSessionRole()).toBeNull();
  });

  it('returns null for a tampered cookie value', () => {
    document.cookie = 'foundit_role=superadmin; path=/';
    expect(getSessionRole()).toBeNull();
  });
});

describe('token and user storage', () => {
  it('stores and reads tokens', () => {
    setTokens('access-1', 'refresh-1');
    expect(getAccessToken()).toBe('access-1');
    expect(getRefreshToken()).toBe('refresh-1');
  });

  it('parses the stored user and derives a display name', () => {
    localStorage.setItem(
      'user',
      JSON.stringify({
        userId: 'u1',
        email: 'a@myseneca.ca',
        role: 'student',
        firstName: 'Ada',
        lastName: 'Lovelace',
      })
    );
    expect(getLoggedInUser()?.firstName).toBe('Ada');
    expect(getLoggedInDisplayName()).toBe('Ada Lovelace');
  });

  it('returns null for corrupted user JSON', () => {
    localStorage.setItem('user', '{not json');
    expect(getLoggedInUser()).toBeNull();
    expect(getLoggedInDisplayName()).toBeNull();
  });

  it('clearAuthSession removes tokens, user and role cookie', () => {
    setTokens('access-1', 'refresh-1');
    localStorage.setItem('user', '{}');
    setSessionRole('security');

    clearAuthSession();

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(getSessionRole()).toBeNull();
  });
});
