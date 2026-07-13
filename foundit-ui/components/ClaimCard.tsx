'use client';

import { Box, Flex, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import type { SecurityClaimListItem } from '@/types/claims';
import {
  formatClaimDate,
  formatClaimId,
  getClaimCardStatus,
  getClaimItemName,
} from '@/utils/claimDisplay';

interface ClaimCardProps {
  claim: SecurityClaimListItem;
}

export function ClaimCard({ claim }: ClaimCardProps) {
  const { strip, label, color } = getClaimCardStatus(claim);
  const itemName = getClaimItemName(claim);

  return (
    <Flex
      w="full"
      bg="white"
      borderRadius="md"
      boxShadow="sm"
      borderWidth="1px"
      borderColor="gray.200"
      overflow="hidden"
      align="stretch"
      role="article"
      aria-label={`Claim ${claim.claimId}: ${claim.category} | ${itemName}, ${label}`}
    >
      <Box w="4px" bg={strip} flexShrink={0} />

      <Stack
        direction={{ base: 'column', md: 'row' }}
        flex={1}
        px={4}
        py={3}
        justify="space-between"
        align={{ base: 'stretch', md: 'center' }}
      >
        <HStack gap={3} align="center" minW={0} overflow="hidden">
          <VStack align="start" gap={0}>
            <Text fontWeight="semibold" fontSize="sm" color="gray.800">
              {claim.category} | {itemName}
            </Text>
            <Text fontSize="xs" color="gray.500">
              Claim: #{formatClaimId(claim.claimId)}
            </Text>
          </VStack>
        </HStack>

        <VStack
          align="end"
          gap={0}
          flexShrink={0}
          alignSelf={{ base: 'flex-end', md: 'auto' }}
        >
          <Text fontSize="sm" fontWeight="semibold" color={color}>
            {label}
          </Text>
          <Text fontSize="xs" color="gray.400">
            {formatClaimDate(claim.createdAt)}
          </Text>
        </VStack>
      </Stack>
    </Flex>
  );
}
