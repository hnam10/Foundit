'use client';

import type { ReactNode } from 'react';
import { Box, Flex, Stack, Text } from '@chakra-ui/react';

const rowLabelStyles = {
  flexShrink: 0,
  w: { base: '130px', sm: '155px' },
  fontSize: 'xs',
  fontWeight: 'semibold',
  lineHeight: '16px',
  color: 'gray.500',
  textTransform: 'uppercase',
  letterSpacing: 'wide',
} as const;

export function ItemDetailRow({
  label,
  value,
  input,
}: {
  label: string;
  value: string;
  input?: ReactNode;
}) {
  return (
    <Flex align="flex-start" gap={4}>
      <Text {...rowLabelStyles} mt={input ? 2 : 0}>
        {label}
      </Text>
      {input ? (
        <Box flex={1} minW={0}>
          {input}
        </Box>
      ) : (
        <Text
          flex={1}
          fontSize="md"
          lineHeight="24px"
          color="gray.800"
          minW={0}
          whiteSpace="pre-wrap"
        >
          {value}
        </Text>
      )}
    </Flex>
  );
}

export function ItemDetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Stack gap={1}>
      <Text
        fontSize="xs"
        fontWeight="semibold"
        lineHeight="16px"
        color="gray.500"
        textTransform="uppercase"
        letterSpacing="wide"
      >
        {label}
      </Text>
      <Text
        fontSize="md"
        lineHeight="24px"
        color="gray.800"
        whiteSpace="pre-wrap"
      >
        {value}
      </Text>
    </Stack>
  );
}

export function ItemDetailFieldControl({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Stack gap={1}>
      <Text
        fontSize="xs"
        fontWeight="semibold"
        lineHeight="16px"
        color="gray.500"
        textTransform="uppercase"
        letterSpacing="wide"
      >
        {label}
      </Text>
      {children}
    </Stack>
  );
}
