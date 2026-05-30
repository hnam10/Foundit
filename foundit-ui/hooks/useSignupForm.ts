'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  validateRequired,
  validatePassword,
  validatePasswordMatch,
  validateSchoolId,
} from '@/utils/validation';

type Role = 'student' | 'security';

export function useSignUpForm() {
  const router = useRouter();

  const [role, setRole] = useState<Role>('student');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [schoolIdError, setSchoolIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  function validateSchoolIdField(value: string, currentRole: Role = role) {
    const idError = validateSchoolId(value, currentRole);
    setSchoolIdError(idError);
  }

  function handleSignUp() {
    const firstError = validateRequired(firstName);
    const lastError = validateRequired(lastName);
    const idError = validateSchoolId(schoolId, role);
    const passError = validatePassword(password);
    const confirmError = validatePasswordMatch(password, confirmPassword);

    setFirstNameError(firstError);
    setLastNameError(lastError);
    setSchoolIdError(idError);
    setPasswordError(passError);
    setConfirmPasswordError(confirmError);

    if (firstError || lastError || idError || passError || confirmError) {
      return;
    }

    router.push('/login');
  }

  function handleRoleChange(newRole: Role) {
    setRole(newRole);
    if (schoolId) {
      validateSchoolIdField(schoolId, newRole);
    }
  }

  return {
    role,
    setRole: handleRoleChange,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    schoolId,
    setSchoolId,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    firstNameError,
    lastNameError,
    schoolIdError,
    passwordError,
    confirmPasswordError,
    validateSchoolIdField,
    handleSignUp,
  };
}
