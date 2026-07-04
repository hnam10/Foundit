import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch } from '@/lib/api/client';
import { getAccessToken, getSessionRole } from '@/utils/auth';
import { useLoginForm } from '@/hooks/useLoginForm';

vi.mock('@/lib/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/client')>();
  return { ...actual, apiFetch: vi.fn() };
});

const apiFetchMock = vi.mocked(apiFetch);

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  document.cookie = 'foundit_role=; max-age=0; path=/';
});

describe('useLoginForm', () => {
  it('validates the email and password before calling the API', async () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setEmail('user@gmail.com');
    });
    await act(() => result.current.handleLogin());

    expect(result.current.emailError).toBe('Please use your Seneca email.');
    expect(result.current.passwordError).toBe('Please enter your password.');
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it('shows the backend message when login is rejected', async () => {
    apiFetchMock.mockRejectedValueOnce(
      new ApiError(401, 'Invalid email or password.')
    );
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setEmail('user@myseneca.ca');
      result.current.setPassword('Abcdefg1!');
    });
    await act(() => result.current.handleLogin());

    expect(result.current.passwordError).toBe('Invalid email or password.');
    expect(getAccessToken()).toBeNull();
  });

  it('stores tokens, user and role cookie on success', async () => {
    apiFetchMock.mockResolvedValueOnce({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      user: {
        userId: 'u1',
        email: 'user@myseneca.ca',
        role: 'student',
        firstName: 'Ada',
        lastName: 'Lovelace',
      },
    });
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setEmail('User@MySeneca.ca');
      result.current.setPassword('Abcdefg1!');
    });
    await act(() => result.current.handleLogin());

    expect(apiFetchMock).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({
        email: 'user@myseneca.ca',
        password: 'Abcdefg1!',
      }),
    });
    expect(getAccessToken()).toBe('access-1');
    expect(getSessionRole()).toBe('student');
    expect(JSON.parse(localStorage.getItem('user') ?? '{}').firstName).toBe(
      'Ada'
    );
  });
});
