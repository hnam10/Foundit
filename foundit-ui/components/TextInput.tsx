import React from 'react';
import { Field, Input } from '@chakra-ui/react';

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
  ...rest
}: TextInputProps) {
  const isInvalid = !!error;

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
      <Input
        type={type}
        autoComplete={autoComplete}
        placeholder={undefined}
        h={12}
        px={4}
        fontSize="1rem"
        fontWeight="normal"
        color="#1a1a1a"
        bg="white"
        borderWidth="1px"
        borderRadius="md"
        borderColor="#D9D9D9"
        _invalid={{ borderColor: '#cd0000' }}
        _focusVisible={{
          outline: 'none',
          boxShadow: '0 0 0 2px #009adb',
          borderColor: 'inherit',
        }}
        w={widthMap[width]}
        maxW={widthMap[width]}
        {...rest}
      />
    </Field.Root>
  );
}
