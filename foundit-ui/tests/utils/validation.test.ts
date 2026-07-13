import { describe, expect, it } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateRequired,
  validateSchoolId,
} from '@/utils/validation';

describe('validateEmail', () => {
  it('requires a value', () => {
    expect(validateEmail('')).toBe('Please enter your email.');
  });

  it('rejects malformed addresses', () => {
    expect(validateEmail('not-an-email')).toBe('Invalid email format.');
    expect(validateEmail('a b@myseneca.ca')).toBe('Invalid email format.');
  });

  it('rejects non-Seneca domains', () => {
    expect(validateEmail('user@gmail.com')).toBe(
      'Please use your Seneca email.'
    );
  });

  it('accepts Seneca addresses regardless of case', () => {
    expect(validateEmail('user@myseneca.ca')).toBe('');
    expect(validateEmail('User@MySeneca.CA')).toBe('');
  });
});

describe('validatePassword', () => {
  it('requires a value', () => {
    expect(validatePassword('')).toBe('Please enter your password.');
  });

  it('enforces minimum length', () => {
    expect(validatePassword('Ab1!')).toBe('Must be at least 8 characters.');
  });

  it('requires an uppercase letter and a number', () => {
    expect(validatePassword('alllower1!')).toBe(
      'Include at least one uppercase letter and one number.'
    );
    expect(validatePassword('NoNumbers!')).toBe(
      'Include at least one uppercase letter and one number.'
    );
  });

  it('requires a special character', () => {
    expect(validatePassword('Abcdefg1')).toBe(
      'Must contain a special character.'
    );
  });

  it('accepts a compliant password', () => {
    expect(validatePassword('Abcdefg1!')).toBe('');
  });
});

describe('validatePasswordMatch', () => {
  it('requires confirmation', () => {
    expect(validatePasswordMatch('a', '')).toBe(
      'Please confirm your password.'
    );
  });

  it('rejects mismatches and accepts matches', () => {
    expect(validatePasswordMatch('one', 'two')).toBe('Passwords do not match.');
    expect(validatePasswordMatch('same', 'same')).toBe('');
  });
});

describe('validateRequired', () => {
  it('rejects empty and whitespace-only values', () => {
    expect(validateRequired('')).toBe('This field is required.');
    expect(validateRequired('   ')).toBe('This field is required.');
    expect(validateRequired('x')).toBe('');
  });
});

describe('validateSchoolId', () => {
  it('rejects non-numeric input', () => {
    expect(validateSchoolId('12a456789', 'student')).toBe(
      'Only numbers are allowed.'
    );
  });

  it('enforces 9 digits for students and 12 for security', () => {
    expect(validateSchoolId('12345678', 'student')).toBe(
      'Student ID must be 9 digits.'
    );
    expect(validateSchoolId('123456789', 'student')).toBe('');
    expect(validateSchoolId('123456789', 'security')).toBe(
      'Employee ID must be 12 digits.'
    );
    expect(validateSchoolId('123456789012', 'security')).toBe('');
  });
});
