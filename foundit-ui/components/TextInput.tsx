'use client';

import React, { useState } from 'react';
import { Box, Field, IconButton, Input } from '@chakra-ui/react';
import { LuEye, LuEyeOff } from 'react-icons/lu';

// ─── Map fixed width variants to Chakra UI size units ───────────────────────
const widthMap = {
  '2-char': '8ex',
  '3-char': '10ex',
  '4-char': '12ex',
  '5-char': '14ex',
  '7-char': '17ex',
  '10-char': '23ex',
  '20-char': '41ex',
  full: '100%',
} as const;

type WidthVariant = keyof typeof widthMap;

export interface TextInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'id' | 'size' | 'width'
> {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  width?: WidthVariant;
  id?: string;
}

export default function TextInput({
  label,
  required = false,
  hint,
  error,
  width = 'full',
  id,
  type = 'text',
  autoComplete,
  onBlur,
  ...rest
}: TextInputProps) {
  const isInvalid = !!error;
  const isPasswordField = type === 'password';
  const [showPassword, setShowPassword] = useState(false);
  const inputType = isPasswordField && showPassword ? 'text' : type;

  const inputStyles = {
    type: inputType,
    autoComplete,
    placeholder: undefined,
    h: 12,
    px: 4,
    fontSize: '1rem',
    fontWeight: 'normal' as const,
    color: '#1a1a1a',
    bg: 'white',
    borderWidth: '1px',
    borderRadius: 'md',
    borderColor: '#D9D9D9',
    _invalid: { borderColor: '#cd0000' },
    _focusVisible: {
      outline: 'none',
      boxShadow: '0 0 0 2px #009adb',
      borderColor: 'inherit',
    },
    w: widthMap[width],
    maxW: widthMap[width],
    onBlur,
    ...rest,
  };

  return (
    // 1. In v3, FormControl is replaced by Field.Root
    <Field.Root id={id} required={required} invalid={isInvalid} mb={0}>
      {/* 2. In v3, FormLabel is replaced by Field.Label */}
      <Field.Label
        fontSize="1rem"
        fontWeight="semibold"
        lineHeight="1.6"
        color="#1a1a1a"
        mb={1}
      >
        {label}
      </Field.Label>

      {/* 3. In v3, FormHelperText is replaced by Field.HelperText */}
      {hint && (
        <Field.HelperText
          fontSize="0.875rem"
          lineHeight="1.6"
          color="#666666"
          mt={0.5}
          mb={1}
        >
          {hint}
        </Field.HelperText>
      )}

      {/* 4. In v3, FormErrorMessage is replaced by Field.ErrorText */}
      {error && (
        <Field.ErrorText
          fontSize="0.875rem"
          fontWeight="normal"
          color="#cd0000"
          mt={0.2}
          mb={1}
        >
          {error}
        </Field.ErrorText>
      )}

      {/* 5. Input Field */}
      {isPasswordField ? (
        <Box position="relative" w={widthMap[width]} maxW={widthMap[width]}>
          <Input {...inputStyles} pr={12} w="100%" maxW="100%" />
          <IconButton
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            variant="ghost"
            size="sm"
            type="button"
            position="absolute"
            right={2}
            top="50%"
            transform="translateY(-50%)"
            color="#666666"
            onClick={() => setShowPassword((prev) => !prev)}
            css={{
              _icon: {
                width: '5',
                height: '5',
              },
            }}
          >
            {showPassword ? <LuEyeOff /> : <LuEye />}
          </IconButton>
        </Box>
      ) : (
        <Input {...inputStyles} />
      )}
    </Field.Root>
  );
}
