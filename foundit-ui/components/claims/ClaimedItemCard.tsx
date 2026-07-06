'use client';

import { Grid, Heading, Stack } from '@chakra-ui/react';
import { DetailImageGallery } from '@/components/DetailImageGallery';
import type { SecurityClaimDetail } from '@/types/claims';
import { formatClaimDate, getClaimItemName } from '@/utils/claimDisplay';
import { ClaimCard } from './ClaimCard';
import { ClaimDetailField } from './ClaimDetailField';

interface ClaimedItemCardProps {
  claim: SecurityClaimDetail;
}

export function ClaimedItemCard({ claim }: ClaimedItemCardProps) {
  const itemName = getClaimItemName(claim);

  return (
    <ClaimCard>
      <Heading as="h2" fontSize="lg" fontWeight="bold" color="gray.900" mb={4}>
        Claimed Item
      </Heading>
      <Grid
        templateColumns={{ base: '1fr', sm: '1fr auto' }}
        gap={6}
        alignItems="start"
      >
        <Stack gap={4}>
          <ClaimDetailField label="Category" value={claim.category} />
          <ClaimDetailField label="Item Name" value={itemName} />
          <ClaimDetailField
            label="Date Lost"
            value={formatClaimDate(claim.dateLost)}
          />
          <ClaimDetailField
            label="Location Lost"
            value={claim.locationLost ?? '—'}
          />
          <ClaimDetailField
            label="Claim Description"
            value={claim.description}
          />
        </Stack>
        <DetailImageGallery images={claim.images} alt={itemName} />
      </Grid>
    </ClaimCard>
  );
}
