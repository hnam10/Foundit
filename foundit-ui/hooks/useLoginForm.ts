'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateEmail } from '@/utils/validation';
import { setSessionRole, type UserRole } from '@/utils/auth';

/** Temporary until login API returns role. */
function inferRoleFromEmail(email: string): UserRole {
  const lower = email.toLowerCase();
  if (lower.includes('security') || lower.endsWith('@senecapolytechnic.ca')) {
    return 'security';
  }
  return 'student';
}

export function useLoginForm() {
  const router = useRouter();

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
    // TODO: connect login API — use response.role instead of inferRoleFromEmail

    /*
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  }
);
const { role } = await response.json();
setSessionRole(role);
*/

    const role = inferRoleFromEmail(email);
    setSessionRole(role);
    router.push('/dashboard');
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
