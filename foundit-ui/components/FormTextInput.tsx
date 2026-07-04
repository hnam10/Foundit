'use client';

import React from 'react';
import { Box, Field, HStack, Input } from '@chakra-ui/react';
import FieldError from './FieldError';
import {
  fieldControlStyles,
  fieldHelperStyles,
  fieldLabelStyles,
  inlineFieldLabelStyles,
} from './ui/field-styles';

export interface FormTextInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'id' | 'size' | 'width'
> {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  id?: string;
  stacked?: boolean;
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
  stacked = false,
  onBlur,
  ...rest
}: FormTextInputProps) {
  const isInvalid = !!error;

  const hintEl = hint ? (
    <Field.HelperText {...fieldHelperStyles} mt={0} mb={1}>
      {hint}
    </Field.HelperText>
  ) : null;

  const inputEl = (
    <Input
      {...fieldControlStyles}
      h={12}
      px={4}
      w="full"
      onBlur={onBlur}
      {...rest}
    />
  );

  if (stacked) {
    return (
      <Field.Root id={id} required={required} invalid={isInvalid} mb={0}>
        <Field.Label {...fieldLabelStyles} mb={1}>
          {label}
          <Field.RequiredIndicator color="fg" />
        </Field.Label>
        {hintEl}
        {inputEl}
        <FieldError error={error} />
      </Field.Root>
    );
  }

  return (
    <Field.Root id={id} required={required} invalid={isInvalid} mb={0}>
      <HStack align="flex-start" gap={4} w="full">
        <Field.Label {...inlineFieldLabelStyles}>
          {label}
          <Field.RequiredIndicator color="fg" />
        </Field.Label>

        <Box flex={1}>
          {hintEl}
          {inputEl}
          <FieldError error={error} />
        </Box>
      </HStack>
    </Field.Root>
  );
}
