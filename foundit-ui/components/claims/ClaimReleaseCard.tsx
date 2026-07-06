'use client';

import { Badge, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { IoLockClosed } from 'react-icons/io5';
import { Button } from '@/components/ui/Button';
import { ClaimCard } from './ClaimCard';

interface ClaimReleaseCardProps {
  canRelease: boolean;
}

export function ClaimReleaseCard({ canRelease }: ClaimReleaseCardProps) {
  return (
    <ClaimCard>
      <Flex justify="space-between" align="start" mb={4} gap={2}>
        <Heading as="h2" fontSize="lg" fontWeight="bold" color="gray.900">
          Release Item
        </Heading>
        <Badge colorPalette="gray" variant="subtle">
          Pending
        </Badge>
      </Flex>
      <Stack gap={4}>
        <Text fontSize="sm" color="gray.600">
          Complete the verification checklist before releasing the item to the
          student.
        </Text>
        <Button
          variant="primary"
          disabled={!canRelease}
          title={
            canRelease
              ? 'Release coming soon'
              : 'Complete verification checklist first'
          }
          w={{ base: 'full', sm: 'auto' }}
        >
          {!canRelease ? <IoLockClosed /> : null}
          Release Item to Student
        </Button>
      </Stack>
    </ClaimCard>
  );
}
