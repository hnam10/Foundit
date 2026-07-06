'use client';

import { Badge, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { Button } from '@/components/ui/Button';
import { ClaimCard } from './ClaimCard';

export function ClaimAppointmentCard() {
  return (
    <ClaimCard>
      <Flex justify="space-between" align="start" mb={3} gap={2}>
        <Heading as="h2" fontSize="lg" fontWeight="bold" color="gray.900">
          Appointment
        </Heading>
        <Badge colorPalette="gray" variant="subtle">
          Pending
        </Badge>
      </Flex>
      <Stack gap={4}>
        <Text fontSize="sm" color="gray.600">
          Waiting for the student to schedule a pickup appointment.
        </Text>
        <Button variant="outline" disabled title="Coming soon">
          Resend Invite
        </Button>
      </Stack>
    </ClaimCard>
  );
}
