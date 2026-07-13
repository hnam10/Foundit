'use client';

import { Box, Flex, Spinner, Stack, Text } from '@chakra-ui/react';
import { IoSearchOutline } from 'react-icons/io5';

interface ClaimMatchEmptyStateProps {
  searching?: boolean;
}

export function ClaimMatchEmptyState({
  searching = false,
}: ClaimMatchEmptyStateProps) {
  if (searching) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        py={12}
        px={4}
        textAlign="center"
        gap={3}
      >
        <Spinner size="md" color="blue.500" />
        <Text fontSize="sm" color="gray.500">
          Searching stored items for a match…
        </Text>
      </Flex>
    );
  }

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      py={12}
      px={4}
      textAlign="center"
      gap={4}
    >
      <Box color="gray.400" fontSize="3xl">
        <IoSearchOutline />
      </Box>
      <Stack gap={2} maxW="sm">
        <Text fontSize="md" fontWeight="semibold" color="gray.800">
          No match yet
        </Text>
        <Text fontSize="sm" color="gray.500">
          No stored items scored high enough for this claim. Try the Manual
          Search tab to browse items yourself.
        </Text>
      </Stack>
    </Flex>
  );
}
