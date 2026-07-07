'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import type { ApiClaimStatus } from '@/types/claims';

const CLAIM_STEPS: ApiClaimStatus[] = [
  'submitted',
  'under_review',
  'approved',
  'picked_up',
];

const CLAIM_STATUS_LABELS: Record<ApiClaimStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  picked_up: 'Picked Up',
};

type Props = {
  status: ApiClaimStatus;
};

export function ClaimStatusProgress({ status }: Props) {
  if (status === 'rejected') {
    return (
      <Text fontSize="sm" fontWeight="medium" color="red.500">
        Rejected
      </Text>
    );
  }

  const activeIndex = Math.max(0, CLAIM_STEPS.indexOf(status));
  const activeLabel = CLAIM_STATUS_LABELS[status];

  return (
    <Box w="full" maxW="400px">
      <Box position="relative" h="52px">
        <Text
          position="absolute"
          top={0}
          left={`${(activeIndex / (CLAIM_STEPS.length - 1)) * 100}%`}
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
          {CLAIM_STEPS.map((step, index) => {
            const isComplete = index <= activeIndex;
            const isLast = index === CLAIM_STEPS.length - 1;

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