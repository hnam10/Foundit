'use client';

import {
  Box,
  Flex,
  Heading,
  Link,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import type { CategoryStat } from '@/types/items';

export interface ItemsByCategoryCardProps {
  categoryStats: CategoryStat[];
  loading?: boolean;
  error?: string;
}

export function ItemsByCategoryCard({
  categoryStats,
  loading = false,
  error = '',
}: ItemsByCategoryCardProps) {
  const total = categoryStats.reduce((sum, stat) => sum + stat.count, 0);

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="lg"
      p={{ base: 5, md: 6 }}
      h="full"
    >
      <Flex justify="space-between" align="center" gap={3} mb={5}>
        <Heading as="h2" fontSize="md" fontWeight="bold" color="gray.900">
          Items in Storage
        </Heading>
        <Link
          asChild
          fontSize="sm"
          color="blue.600"
          fontWeight="medium"
          _hover={{ textDecoration: 'underline' }}
        >
          <NextLink href="/security/items">View all items</NextLink>
        </Link>
      </Flex>

      {loading ? (
        <Box
          minH="180px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner size="lg" color="blue.500" />
        </Box>
      ) : error ? (
        <Text color="red.600" fontSize="sm" textAlign="center" py={8}>
          {error}
        </Text>
      ) : categoryStats.length === 0 ? (
        <Text color="gray.600" fontSize="sm" textAlign="center" py={8}>
          No items in storage.
        </Text>
      ) : (
        <Stack gap={4}>
          {categoryStats.map((stat) => {
            const percent =
              total > 0 ? Math.round((stat.count / total) * 100) : 0;

            return (
              <Box key={stat.category}>
                <Flex justify="space-between" align="center" gap={3} mb={1.5}>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.800"
                    lineClamp={1}
                  >
                    {stat.category}
                  </Text>
                  <Text fontSize="sm" color="gray.600" flexShrink={0}>
                    {stat.count}{' '}
                    <Text as="span" color="gray.400">
                      ({percent}%)
                    </Text>
                  </Text>
                </Flex>
                <Box h="2" bg="gray.100" borderRadius="full" overflow="hidden">
                  <Box
                    h="full"
                    w={`${percent}%`}
                    bg="blue.500"
                    borderRadius="full"
                    transition="width 0.2s ease"
                  />
                </Box>
              </Box>
            );
          })}

          <Flex
            justify="space-between"
            align="center"
            pt={3}
            mt={1}
            borderTopWidth="1px"
            borderColor="gray.200"
          >
            <Text fontSize="sm" fontWeight="semibold" color="gray.800">
              Total in storage
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="gray.900">
              {total}
            </Text>
          </Flex>
        </Stack>
      )}
    </Box>
  );
}
