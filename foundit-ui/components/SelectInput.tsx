'use client';

import React from 'react';
import { Box, Field, HStack, NativeSelect } from '@chakra-ui/react';
import FieldError from './FieldError';
import {
  fieldControlStyles,
  fieldHelperStyles,
  inlineFieldLabelStyles,
} from './ui/field-styles';

export interface SelectInputProps {
  label: string;
  options: readonly string[];
  required?: boolean;
  hint?: string;
  error?: string;
  id?: string;
  placeholder?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  onBlur?: React.FocusEventHandler<HTMLSelectElement>;
  /**
   * Width of the select control. Defaults to 'full' (fill the column);
   * pass 'fit-content' to shrink it to the longest option.
   */
  selectWidth?: string;
}

// Two-column <select> field (label left, control right) matching FormTextInput.
export default function SelectInput({
  label,
  options,
  required = false,
  hint,
  error,
  id,
  placeholder = 'Select an option',
  value,
  onChange,
  onBlur,
  selectWidth = 'full',
}: SelectInputProps) {
  const isInvalid = !!error;

  return (
    <Field.Root id={id} required={required} invalid={isInvalid} mb={0}>
      <HStack align="flex-start" gap={4} w="full">
        <Field.Label {...inlineFieldLabelStyles}>
          {label}
          <Field.RequiredIndicator color="fg" />
        </Field.Label>

        <Box flex={1}>
          {hint && (
            <Field.HelperText {...fieldHelperStyles} mt={0} mb={1}>
              {hint}
            </Field.HelperText>
          )}

          <NativeSelect.Root w={selectWidth}>
            {/* pe reserves room for the absolutely-positioned Indicator so
                option text never runs under the chevron (matters most with
                selectWidth="fit-content", where width is intrinsic). */}
            <NativeSelect.Field
              {...fieldControlStyles}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              h={12}
              ps={4}
              pe={10}
              color={value ? 'fg' : 'gray.400'}
            >
              <option value="" disabled>
                {placeholder}
              </option>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>

          <FieldError error={error} />
        </Box>
      </HStack>
    </Field.Root>
  );
}
