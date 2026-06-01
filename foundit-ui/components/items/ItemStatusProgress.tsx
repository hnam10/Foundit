'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import type { StoredItemStatus } from '@/constants/mockStoredItems';

const STEPS = ['Received', 'Under Review', 'Approved', 'Picked up'] as const;

const STATUS_STEP_INDEX: Record<StoredItemStatus, number> = {
  received: 0,
  under_review: 1,
  approved: 2,
  picked_up: 3,
};

interface ItemStatusProgressProps {
  status: StoredItemStatus;
}

export function ItemStatusProgress({ status }: ItemStatusProgressProps) {
  const activeIndex = STATUS_STEP_INDEX[status];
  const activeLabel = STEPS[activeIndex];

  return (
    <Box w="full" maxW="280px" ml="auto" pt={6}>
      <Box position="relative" h="52px">
        <Text
          position="absolute"
          top={0}
          left={`${(activeIndex / (STEPS.length - 1)) * 100}%`}
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
          {STEPS.map((_, index) => {
            const isComplete = index <= activeIndex;
            const isLast = index === STEPS.length - 1;

            return (
              <Flex
                key={STEPS[index]}
                align="center"
                flex={isLast ? '0 0 auto' : 1}
              >
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
