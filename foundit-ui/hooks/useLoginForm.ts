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

  function handleLogin() {
    const emailValidation = validateEmail(email);
    const passwordValidation = !password ? 'Please enter your password.' : '';

    setEmailError(emailValidation);
    setPasswordError(passwordValidation);

    if (emailValidation || passwordValidation) {
      return;
    }

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
