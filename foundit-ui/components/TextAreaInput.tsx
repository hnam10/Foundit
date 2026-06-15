'use client';

import React from 'react';
import { Box, Field, HStack, Textarea } from '@chakra-ui/react';
import FieldError from './FieldError';

export interface TextAreaInputProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'id'
> {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  id?: string;
  // When true, the label sits ABOVE the field (full width) instead of in the
  // left column. Used for Description to match the design.
  stacked?: boolean;
}

export default function TextAreaInput({
  label,
  required = false,
  hint,
  error,
  id,
  stacked = false,
  onBlur,
  ...rest
}: TextAreaInputProps) {
  const isInvalid = !!error;

  const control = (
    <Textarea
      minH="120px"
      px={4}
      py={3}
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
  );

  const hintEl = hint ? (
    <Field.HelperText
      fontSize="0.875rem"
      lineHeight="1.6"
      color="#666666"
      mt={0}
      mb={1}
    >
      {hint}
    </Field.HelperText>
  ) : null;

  const errorEl = <FieldError error={error} />;

  if (stacked) {
    return (
      <Field.Root id={id} required={required} invalid={isInvalid} mb={0}>
        <Field.Label
          mb={1}
          fontSize="1rem"
          fontWeight="semibold"
          lineHeight="1.6"
          color="#1a1a1a"
        >
          {label}
          <Field.RequiredIndicator color="#1a1a1a" />
        </Field.Label>
        {hintEl}
        {control}
        {errorEl}
      </Field.Root>
    );
  }

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
          {hintEl}
          {control}
          {errorEl}
        </Box>
      </HStack>
    </Field.Root>
  );
}
