'use client';

import { Box, Flex, Image, Stack, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import type { SecurityItemListItem } from '@/types/items';
import { ItemStatusProgress } from './ItemStatusProgress';

interface StoredItemCardProps {
  item: SecurityItemListItem;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-CA');
}

function shortItemId(itemId: string): string {
  return itemId.slice(0, 8).toUpperCase();
}

export function StoredItemCard({ item }: StoredItemCardProps) {
  return (
    <NextLink
      href={`/security/items/${item.itemId}`}
      style={{ textDecoration: 'none' }}
    >
      <Flex
        bg="white"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="md"
        p={4}
        gap={4}
        align="stretch"
        role="article"
        aria-label={`${item.category} ${item.title}, item ${shortItemId(item.itemId)}`}
        _hover={{ borderColor: 'blue.300', boxShadow: 'sm' }}
        transition="border-color 0.15s, box-shadow 0.15s"
      >
        <Box
          flexShrink={0}
          w="72px"
          h="72px"
          borderRadius="md"
          overflow="hidden"
          bg="gray.200"
        >
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.title}
              w="full"
              h="full"
              objectFit="cover"
            />
          ) : null}
        </Box>

        <Flex flex={1} direction="column" minW={0}>
          <Flex justify="space-between" align="flex-start" gap={4}>
            <Stack gap={0.5} minW={0}>
              <Text fontWeight="bold" fontSize="sm" color="gray.900">
                {item.category} | {item.title}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {item.campusName}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Item ID {shortItemId(item.itemId)}
              </Text>
            </Stack>
            <Text fontSize="sm" color="gray.600" flexShrink={0}>
              {formatDate(item.dateFound)}
            </Text>
          </Flex>

          <ItemStatusProgress status={item.status} />
        </Flex>
      </Flex>
    </NextLink>
  );
}
