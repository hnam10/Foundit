'use client';

import { Badge, Box, Flex, Text } from '@chakra-ui/react';
import type { ItemStatus } from '@/types/items';
import { ITEM_STATUS_COLORS, ITEM_STATUS_LABELS } from '@/types/items';

const HAPPY_PATH_STEPS: ItemStatus[] = ['pending_report', 'stored', 'claimed'];

const TERMINAL_STATUSES = new Set<ItemStatus>(['expired', 'disposed']);

interface ItemStatusProps {
  status: ItemStatus;
}

export function ItemStatusBadge({ status }: ItemStatusProps) {
  const { colorPalette } = ITEM_STATUS_COLORS[status];

  return (
    <Badge
      colorPalette={colorPalette}
      variant="subtle"
      fontSize="xs"
      px={2}
      py={0.5}
      borderRadius="full"
      flexShrink={0}
    >
      {ITEM_STATUS_LABELS[status]}
    </Badge>
  );
}

export function ItemStatusProgress({ status }: ItemStatusProps) {
  if (TERMINAL_STATUSES.has(status)) {
    return (
      <Box w="full" maxW="400px">
        <Text fontSize="sm" fontWeight="medium" color="gray.600">
          {ITEM_STATUS_LABELS[status]}
        </Text>
      </Box>
    );
  }

  const activeIndex = HAPPY_PATH_STEPS.indexOf(status);
  const activeLabel = ITEM_STATUS_LABELS[status];

  return (
    <Box w="full" maxW="400px">
      <Box position="relative" h="52px">
        <Text
          position="absolute"
          top={0}
          left={`${(activeIndex / (HAPPY_PATH_STEPS.length - 1)) * 100}%`}
          transform="translateX(-50%)"
          fontSize="xs"
          fontWeight="medium"
          color="blue.600"
          whiteSpace="nowrap"
        >
          {activeLabel}
        </Text>

        <Flex
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          align="center"
          justify="space-between"
        >
          {HAPPY_PATH_STEPS.map((step, index) => {
            const isComplete = index <= activeIndex;
            const isLast = index === HAPPY_PATH_STEPS.length - 1;

            return (
              <Flex key={step} align="center" flex={isLast ? '0 0 auto' : 1}>
                <Box
                  w="10px"
                  h="10px"
                  borderRadius="full"
                  bg={isComplete ? 'blue.500' : 'gray.300'}
                  flexShrink={0}
                  zIndex={1}
                />
                {!isLast && (
                  <Box
                    flex={1}
                    h="2px"
                    bg={index < activeIndex ? 'blue.500' : 'gray.300'}
                    mx="-1px"
                  />
                )}
              </Flex>
            );
          })}
        </Flex>
      </Box>
    </Box>
  );
}
