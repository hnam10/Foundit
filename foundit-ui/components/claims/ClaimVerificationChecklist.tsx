'use client';

import {
  Badge,
  Flex,
  Heading,
  Stack,
  Text,
  Textarea,
  chakra,
} from '@chakra-ui/react';
import { ClaimCard } from './ClaimCard';

const Checkbox = chakra('input');

export interface VerificationState {
  verifyStudentId: boolean;
  proofOfOwnership: boolean;
  studentConfirmation: boolean;
  notes: string;
}

interface ClaimVerificationChecklistProps {
  value: VerificationState;
  onChange: (value: VerificationState) => void;
}

const checklistItems = [
  {
    key: 'verifyStudentId' as const,
    label: 'Verify Student ID',
    description: 'Confirm the student presents valid campus identification.',
  },
  {
    key: 'proofOfOwnership' as const,
    label: 'Proof of Ownership',
    description:
      'Ask for details only the owner would know (case marks, lock screen, etc.).',
  },
  {
    key: 'studentConfirmation' as const,
    label: 'Student Confirmation',
    description:
      'Student confirms the item matches their lost item description.',
  },
];

export function ClaimVerificationChecklist({
  value,
  onChange,
}: ClaimVerificationChecklistProps) {
  function toggle(key: keyof Omit<VerificationState, 'notes'>) {
    onChange({ ...value, [key]: !value[key] });
  }

  return (
    <ClaimCard>
      <Flex justify="space-between" align="start" mb={4} gap={2}>
        <Heading as="h2" fontSize="lg" fontWeight="bold" color="gray.900">
          Verification Checklist
        </Heading>
        <Badge colorPalette="gray" variant="subtle">
          Pending
        </Badge>
      </Flex>
      <Stack gap={4}>
        {checklistItems.map((item) => (
          <Flex key={item.key} gap={3} align="start">
            <Checkbox
              type="checkbox"
              mt={1}
              checked={value[item.key]}
              onChange={() => toggle(item.key)}
              accentColor="var(--chakra-colors-blue-500)"
            />
            <Stack gap={0.5}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                {item.label}
              </Text>
              <Text fontSize="xs" color="gray.600">
                {item.description}
              </Text>
            </Stack>
          </Flex>
        ))}
        <Stack gap={1}>
          <Text
            fontSize="xs"
            fontWeight="semibold"
            color="gray.500"
            textTransform="uppercase"
          >
            Notes (optional)
          </Text>
          <Textarea
            value={value.notes}
            onChange={(e) => onChange({ ...value, notes: e.target.value })}
            placeholder="Add any verification notes..."
            rows={3}
            fontSize="sm"
          />
        </Stack>
      </Stack>
    </ClaimCard>
  );
}

export function isVerificationComplete(value: VerificationState): boolean {
  return (
    value.verifyStudentId && value.proofOfOwnership && value.studentConfirmation
  );
}
