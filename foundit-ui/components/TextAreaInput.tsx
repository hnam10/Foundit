'use client';

import React from 'react';
import { Box, Field, HStack, Textarea } from '@chakra-ui/react';
import FieldError from './FieldError';
import {
  fieldControlStyles,
  fieldHelperStyles,
  fieldLabelStyles,
  inlineFieldLabelStyles,
} from './ui/field-styles';

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
      {...fieldControlStyles}
      minH="120px"
      px={4}
      py={3}
      w="full"
      onBlur={onBlur}
      {...rest}
    />
  );

  const hintEl = hint ? (
    <Field.HelperText {...fieldHelperStyles} mt={0} mb={1}>
      {hint}
    </Field.HelperText>
  ) : null;

  const errorEl = <FieldError error={error} />;

  if (stacked) {
    return (
      <Field.Root id={id} required={required} invalid={isInvalid} mb={0}>
        <Field.Label {...fieldLabelStyles} mb={1}>
          {label}
          <Field.RequiredIndicator color="fg" />
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
        <Field.Label {...inlineFieldLabelStyles}>
          {label}
          <Field.RequiredIndicator color="fg" />
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
