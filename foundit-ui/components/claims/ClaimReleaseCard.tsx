'use client';

import { Badge, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { IoLockClosed } from 'react-icons/io5';
import { Button } from '@/components/ui/Button';
import { ClaimCard } from './ClaimCard';

interface ClaimReleaseCardProps {
  canRelease: boolean;
  disabledReason?: string;
  onRelease: () => void;
  releasing?: boolean;
  releaseError?: string;
}

export function ClaimReleaseCard({
  canRelease,
  disabledReason = 'Complete verification checklist first',
  onRelease,
  releasing = false,
  releaseError,
}: ClaimReleaseCardProps) {
  return (
    <ClaimCard>
      <Flex justify="space-between" align="start" mb={4} gap={2}>
        <Heading as="h2" fontSize="lg" fontWeight="bold" color="gray.900">
          Release Item
        </Heading>
        <Badge colorPalette={canRelease ? 'green' : 'gray'} variant="subtle">
          {canRelease ? 'Ready' : 'Pending'}
        </Badge>
      </Flex>
      <Stack gap={4}>
        <Text fontSize="sm" color="gray.600">
          Complete the verification checklist before releasing the item to the
          student.
        </Text>
        {!canRelease && disabledReason ? (
          <Text fontSize="sm" color="orange.700" fontWeight="medium">
            {disabledReason}
          </Text>
        ) : null}
        {releaseError ? (
          <Text fontSize="sm" color="red.500">
            {releaseError}
          </Text>
        ) : null}
        <Button
          variant="primary"
          disabled={!canRelease || releasing}
          loading={releasing}
          onClick={onRelease}
          title={canRelease ? undefined : disabledReason}
          w={{ base: 'full', sm: 'auto' }}
        >
          {!canRelease ? <IoLockClosed /> : null}
          Release Item to Student
        </Button>
      </Stack>
    </ClaimCard>
  );
}
