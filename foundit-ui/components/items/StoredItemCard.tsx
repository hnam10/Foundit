'use client';

import { Badge, Box, Flex, HStack, Image, Stack, Text } from '@chakra-ui/react';
import { IoCalendarOutline, IoImageOutline } from 'react-icons/io5';
import type { SecurityItemListItem } from '@/types/items';
import { ITEM_STATUS_LABELS } from '@/types/items';
import { getRetentionLabel } from '@/utils/itemRetention';
import { ItemStatusBadge } from './ItemStatusProgress';

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
  const retention = getRetentionLabel(item.retentionExpiryDate, item.status);

  return (
    <Flex
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="lg"
      p={4}
      gap={4}
      align="stretch"
      role="article"
      aria-label={`${item.title}, ${item.category}, found ${formatDate(item.dateFound)}, ${ITEM_STATUS_LABELS[item.status]}${retention ? `, ${retention.label}` : ''}`}
    >
      <Box
        flexShrink={0}
        w="96px"
        h="96px"
        borderRadius="lg"
        overflow="hidden"
        bg="white"
        borderWidth="1px"
        borderColor="gray.200"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            w="full"
            h="full"
            objectFit="cover"
          />
        ) : (
          <Box color="gray.400" aria-hidden>
            <IoImageOutline size={32} />
          </Box>
        )}
      </Box>

      <Stack flex={1} minW={0} gap={2} justify="space-between">
        <Flex justify="space-between" align="flex-start" gap={4}>
          <Stack gap={1} minW={0}>
            <Text
              fontWeight="bold"
              fontSize="md"
              color="gray.900"
              lineClamp={2}
            >
              {item.title}
            </Text>
            <HStack gap={2} flexWrap="wrap">
              <Badge
                colorPalette="gray"
                variant="subtle"
                fontSize="xs"
                px={2}
                py={0.5}
                borderRadius="full"
              >
                {item.category}
              </Badge>
              <Text fontSize="xs" color="gray.500">
                {item.campusName}
              </Text>
            </HStack>
          </Stack>
          <ItemStatusBadge status={item.status} />
        </Flex>

        <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
          <HStack gap={2} fontSize="xs" color="gray.500" flexWrap="wrap">
            <Text fontFamily="mono">ID {shortItemId(item.itemId)}</Text>
            <Text color="gray.300" aria-hidden>
              ·
            </Text>
            <HStack gap={1}>
              <Box aria-hidden flexShrink={0}>
                <IoCalendarOutline size={13} />
              </Box>
              <Text>Found {formatDate(item.dateFound)}</Text>
            </HStack>
          </HStack>
          {retention && (
            <Text fontSize="xs" fontWeight="medium" color={retention.color}>
              Retention: {retention.label}
            </Text>
          )}
        </Flex>
      </Stack>
    </Flex>
  );
}
