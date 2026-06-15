'use client';

import { Box, Field, HStack } from '@chakra-ui/react';
import { LuCircleAlert } from 'react-icons/lu';

// Field error row with a leading warning icon. Always reserves one line of
// height so toggling the error never shifts the surrounding layout. Must be
// rendered inside a Field.Root (uses Field.ErrorText for a11y).
export default function FieldError({ error }: { error?: string }) {
  return (
    <Box minH="1.375rem" mt={1}>
      {error && (
        <Field.ErrorText
          fontSize="0.875rem"
          fontWeight="normal"
          color="#cd0000"
          m={0}
        >
          <HStack gap={1} align="center">
            <LuCircleAlert size={14} aria-hidden />
            <span>{error}</span>
          </HStack>
        </Field.ErrorText>
      )}
    </Box>
  );
}
