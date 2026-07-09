'use client';

import { Grid, Heading } from '@chakra-ui/react';
import type { SecurityClaimDetail } from '@/types/claims';
import { ClaimCard } from './ClaimCard';
import { ClaimDetailField } from './ClaimDetailField';

interface ClaimClaimantCardProps {
  claim: SecurityClaimDetail;
  campusName: string;
}

export function ClaimClaimantCard({
  claim,
  campusName,
}: ClaimClaimantCardProps) {
  const studentName = `${claim.student.firstName} ${claim.student.lastName}`;

  return (
    <ClaimCard>
      <Heading as="h2" fontSize="lg" fontWeight="bold" color="gray.900" mb={4}>
        Claimant Information
      </Heading>
      <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr' }} gap={4}>
        <ClaimDetailField label="Name" value={studentName} />
        <ClaimDetailField
          label="Student ID"
          value={
            claim.student.studentNumber != null
              ? String(claim.student.studentNumber)
              : '—'
          }
        />
        <ClaimDetailField label="Email" value={claim.student.email} />
        <ClaimDetailField label="Campus" value={campusName} />
      </Grid>
    </ClaimCard>
  );
}
