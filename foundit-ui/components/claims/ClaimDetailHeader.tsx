'use client';

import { Badge, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { Button } from '@/components/ui/Button';
import type { ClaimDisplayStatus } from '@/utils/claimDisplay';
import { formatClaimDateTime, formatClaimId } from '@/utils/claimDisplay';

interface ClaimDetailHeaderProps {
  claimId: string;
  submittedAt: string;
  status: ClaimDisplayStatus;
  subtitle?: string;
  onBack: () => void;
}

export function ClaimDetailHeader({
  claimId,
  submittedAt,
  status,
  subtitle,
  onBack,
}: ClaimDetailHeaderProps) {
  return (
    <Stack gap={4}>
      <Button
        variant="muted"
        onClick={onBack}
        alignSelf="flex-start"
        minW="130px"
        h={10}
        fontWeight="semibold"
        fontSize="sm"
      >
        Back to List
      </Button>

      <Flex
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap={4}
      >
        <Stack gap={2}>
          <Heading
            as="h1"
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight="bold"
            color="gray.900"
          >
            Claim #{formatClaimId(claimId)}
          </Heading>
          <Text fontSize="sm" color="gray.600">
            {subtitle ?? `Submitted on ${formatClaimDateTime(submittedAt)}`}
          </Text>
        </Stack>
        <Badge
          colorPalette={status.colorPalette}
          variant="subtle"
          fontSize="sm"
          px={3}
          py={1}
          borderRadius="md"
          fontWeight="semibold"
          flexShrink={0}
        >
          {status.label}
        </Badge>
      </Flex>
    </Stack>
  );
}
