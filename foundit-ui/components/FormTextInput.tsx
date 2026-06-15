'use client';

import React from 'react';
import { Box, Field, HStack, Input } from '@chakra-ui/react';
import FieldError from './FieldError';

export interface FormTextInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'id' | 'size' | 'width'
> {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  id?: string;
}

// Two-column field (label left, input right) matching the Figma design. The
// error renders below the input in the right column. Kept separate from the
// shared components/TextInput so other pages keep their stacked layout.
export default function FormTextInput({
  label,
  required = false,
  hint,
  error,
  id,
  onBlur,
  ...rest
}: FormTextInputProps) {
  const isInvalid = !!error;

  return (
    <Field.Root id={id} required={required} invalid={isInvalid} mb={0}>
      <HStack align="flex-start" gap={4} w="full">
        <Field.Label
          w="180px"
          flexShrink={0}
          mt={2.5}
          mb={0}
          fontSize="1rem"
          fontWeight="semibold"
          lineHeight="1.6"
          color="#1a1a1a"
          whiteSpace="nowrap"
        >
          {label}
          <Field.RequiredIndicator color="#1a1a1a" />
        </Field.Label>

        <Box flex={1}>
          {hint && (
            <Field.HelperText
              fontSize="0.875rem"
              lineHeight="1.6"
              color="#666666"
              mt={0}
              mb={1}
            >
              {hint}
            </Field.HelperText>
          )}

          <Input
            h={12}
            px={4}
            w="full"
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
            onBlur={onBlur}
            {...rest}
          />

          <FieldError error={error} />
        </Box>
      </HStack>
    </Field.Root>
  );
}
