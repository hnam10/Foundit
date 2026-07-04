'use client';

import React from 'react';
import { Box, Field, HStack, NativeSelect } from '@chakra-ui/react';
import FieldError from './FieldError';
import { inlineFieldLabelStyles } from './ui/field-styles';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectInputProps {
  label: string;
  options?: readonly string[];
  optionItems?: readonly SelectOption[];
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
  stacked?: boolean;
}

// Two-column <select> field (label left, control right) matching FormTextInput.
export default function SelectInput({
  label,
  options = [],
  optionItems,
  required = false,
  hint,
  error,
  id,
  placeholder = 'Select an option',
  value,
  onChange,
  onBlur,
  selectWidth = 'full',
  stacked = false,
}: SelectInputProps) {
  const isInvalid = !!error;
  const resolvedOptions: SelectOption[] = optionItems
    ? [...optionItems]
    : options.map((option) => ({ value: option, label: option }));

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

  const selectEl = (
    <NativeSelect.Root w={selectWidth}>
      {/* pe reserves room for the absolutely-positioned Indicator so
          option text never runs under the chevron (matters most with
          selectWidth="fit-content", where width is intrinsic). */}
      <NativeSelect.Field
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        h={12}
        ps={4}
        pe={10}
        fontSize="1rem"
        color={value ? '#1a1a1a' : '#9ca3af'}
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
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {resolvedOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );

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
        {selectEl}
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
          {selectEl}
          <FieldError error={error} />
        </Box>
      </HStack>
    </Field.Root>
  );
}
