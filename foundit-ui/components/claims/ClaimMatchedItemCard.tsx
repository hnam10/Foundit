'use client';

import { Flex, Grid, Heading, Stack, Text } from '@chakra-ui/react';
import { IoImageOutline } from 'react-icons/io5';
import type { SecurityClaimDetail } from '@/types/claims';
import { formatClaimDate } from '@/utils/claimDisplay';
import { ClaimCard } from './ClaimCard';
import { ClaimDetailField } from './ClaimDetailField';

function formatItemId(itemId: string): string {
  return itemId.slice(0, 8).toUpperCase();
}

interface ClaimMatchedItemCardProps {
  claim: SecurityClaimDetail;
}

export function ClaimMatchedItemCard({ claim }: ClaimMatchedItemCardProps) {
  const item = claim.item;
  if (!item) return null;

  return (
    <ClaimCard>
      <Heading as="h2" fontSize="lg" fontWeight="bold" color="gray.900" mb={4}>
        Matched Item
      </Heading>
      <Grid templateColumns={{ base: '1fr', sm: '100px 1fr' }} gap={4}>
        <Flex
          w="100px"
          h="100px"
          borderRadius="md"
          bg="gray.100"
          align="center"
          justify="center"
          color="gray.400"
          fontSize="2xl"
        >
          <IoImageOutline />
        </Flex>
        <Stack gap={3}>
          <ClaimDetailField label="Category" value={item.category} />
          <ClaimDetailField label="Item Name" value={item.title} />
          <ClaimDetailField label="Item ID" value={formatItemId(item.itemId)} />
          <ClaimDetailField
            label="Date Found"
            value={formatClaimDate(item.dateFound)}
          />
          <ClaimDetailField
            label="Location Found"
            value={item.locationFound ?? '—'}
          />
        </Stack>
      </Grid>
    </ClaimCard>
  );
}
