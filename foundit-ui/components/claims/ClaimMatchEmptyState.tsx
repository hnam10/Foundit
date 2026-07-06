'use client';

import { Box, Flex, Stack, Text } from '@chakra-ui/react';
import { IoSearchOutline } from 'react-icons/io5';
import { Button } from '@/components/ui/Button';

export function ClaimMatchEmptyState() {
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
          No AI matches yet
        </Text>
        <Text fontSize="sm" color="gray.500">
          Potential matches appear once stored items are scored against this
          claim. You can also search stored items manually.
        </Text>
      </Stack>
      <Button variant="outline" disabled title="Match search coming soon">
        Run match search
      </Button>
    </Flex>
  );
}
