'use client';

import { Box, Flex, Text } from '@chakra-ui/react';

export interface ClaimCategoryStatProps {
  category: string;
  itemName: string;
  count: number;
}

export function ClaimCategoryStat({
  category,
  itemName,
  count,
}: ClaimCategoryStatProps) {
  return (
    <Box
      bg="blue.50"
      borderRadius="md"
      px={4}
      py={3}
      minH="72px"
      display="flex"
      alignItems="center"
    >
      <Flex justify="space-between" align="center" w="full" gap={3}>
        <Text fontSize="sm" fontWeight="medium" color="gray.800" lineClamp={2}>
          {category} | {itemName}
        </Text>
        <Text fontSize="lg" fontWeight="bold" color="gray.900" flexShrink={0}>
          {count}
        </Text>
      </Flex>
    </Box>
  );
}
