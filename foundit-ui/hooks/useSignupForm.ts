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

  function handleSignUp() {
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

    router.push('/login');
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
