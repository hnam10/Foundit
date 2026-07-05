'use client';

import { Box, Heading, Stack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface FoundItemFormShellProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

export default function FoundItemFormShell({
  title,
  subtitle,
  children,
}: FoundItemFormShellProps) {
  return (
    <Stack
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      rounded="xl"
      shadow="sm"
      maxW="720px"
      w="full"
      mx="auto"
      p={{ base: 6, md: 10 }}
      gap={6}
    >
      {title && (
        <Box>
          <Heading size="lg" color="gray.900">
            {title}
          </Heading>
          {subtitle && (
            <Text fontSize="sm" color="gray.600" mt={1}>
              {subtitle}
            </Text>
          )}
        </Box>
      )}

      {children}
    </Stack>
  );
}
