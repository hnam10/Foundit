'use client';

import { Box, Flex, Image, Stack, Text } from '@chakra-ui/react';
import type { StoredItem } from '@/constants/mockStoredItems';
import { ItemStatusProgress } from './ItemStatusProgress';

interface StoredItemCardProps {
  item: StoredItem;
}

export function StoredItemCard({ item }: StoredItemCardProps) {
  return (
    <Flex
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="md"
      p={4}
      gap={4}
      align="stretch"
      role="article"
      aria-label={`${item.category} ${item.name}, item ${item.id}`}
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
            alt={`${item.name}`}
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
              {item.category} | {item.name}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {item.campusName}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Item ID {item.id}
            </Text>
          </Stack>
          <Text fontSize="sm" color="gray.600" flexShrink={0}>
            {item.date}
          </Text>
        </Flex>

        <ItemStatusProgress status={item.status} />
      </Flex>
    </Flex>
  );
}
