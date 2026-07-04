'use client';

import { useState } from 'react';
import { validateEmail } from '@/utils/validation';
import { ApiError, apiFetch } from '@/lib/api/client';
import {
  getRoleHome,
  sanitizeRedirect,
  setSessionRole,
  setTokens,
  type LoggedInUser,
} from '@/utils/auth';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: LoggedInUser;
}

export function useLoginForm(redirectTo?: string | null) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  function handleEmailBlur() {
    setEmailError(validateEmail(email));
  }

  async function handleLogin() {
    const emailValidation = validateEmail(email);
    const passwordValidation = !password ? 'Please enter your password.' : '';

    setEmailError(emailValidation);
    setPasswordError(passwordValidation);

    if (emailValidation || passwordValidation) {
      return;
    }

    try {
      const result = await apiFetch<LoginResponse>('/api/auth/login', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      setTokens(result.accessToken, result.refreshToken);
      localStorage.setItem('user', JSON.stringify(result.user));

      const role = result.user.role;
      setSessionRole(role);

      const destination = sanitizeRedirect(redirectTo) ?? getRoleHome(role);

      // Full navigation so middleware sees the role cookie on the first request.
      window.location.href = destination;
    } catch (err) {
      // ApiError carries the backend message (or the config/network reason).
      setPasswordError(
        err instanceof ApiError && err.message ? err.message : 'Login failed.'
      );
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    emailError,
    passwordError,
    handleEmailBlur,
    handleLogin,
  };
}
