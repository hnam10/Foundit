'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateEmail } from '@/utils/validation';

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
    // TODO: connect login API after backend auth documentation is provided

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
*/

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
