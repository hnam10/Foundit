'use client';

import { Stack, Text } from '@chakra-ui/react';

export function ClaimDetailField({
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
        color="gray.500"
        textTransform="uppercase"
      >
        {label}
      </Text>
      <Text fontSize="sm" color="gray.800">
        {value}
      </Text>
    </Stack>
  );
}
