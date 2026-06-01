'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  validateRequired,
  validatePassword,
  validatePasswordMatch,
  validateEmail,
} from '@/utils/validation';

type Role = 'student' | 'security';

export function useSignUpForm() {
  const router = useRouter();

  const [role, setRole] = useState<Role>('student');
  const [email, setEmail] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  function handleEmailBlur() {
    setEmailError(validateEmail(email));
  }

  async function handleSignUp() {
    const emailValidation = validateEmail(email);
    const firstError = validateRequired(firstName);
    const lastError = validateRequired(lastName);
    const passError = validatePassword(password);
    const confirmError = validatePasswordMatch(password, confirmPassword);

    setEmailError(emailValidation);
    setFirstNameError(firstError);
    setLastNameError(lastError);
    setPasswordError(passError);
    setConfirmPasswordError(confirmError);

    if (
      emailValidation ||
      firstError ||
      lastError ||
      passError ||
      confirmError
    ) {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            firstName,
            lastName,
            role,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409 && result.code === 'EMAIL_TAKEN') {
          setEmailError('This email is already in use.');
          return;
        }

        setEmailError(
          result.message || 'Something went wrong. Please try again.'
        );
        return;
      }

      router.push('/login');
    } catch {
      setEmailError('Unable to connect to server.');
    }
  }

  return {
    role,
    setRole,
    email,
    setEmail,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    firstNameError,
    lastNameError,
    emailError,
    passwordError,
    confirmPasswordError,
    handleEmailBlur,
    handleSignUp,
  };
}
