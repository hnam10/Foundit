'use client';

import { Box, Text } from '@chakra-ui/react';
import type { ClaimDetailMode } from '@/utils/claimDisplay';

interface StudentNotificationCardProps {
  mode: ClaimDetailMode;
}

const copyByMode: Record<
  ClaimDetailMode,
  { bg: string; borderColor: string; textColor: string; message: string }
> = {
  awaiting: {
    bg: 'gray.50',
    borderColor: 'gray.200',
    textColor: 'gray.700',
    message:
      'The student has not been notified. A match must be found before any pickup steps begin.',
  },
  review: {
    bg: 'green.50',
    borderColor: 'green.200',
    textColor: 'green.800',
    message:
      'Once you confirm a match, the student will be notified to schedule a pickup appointment.',
  },
  post_match: {
    bg: 'blue.50',
    borderColor: 'blue.200',
    textColor: 'blue.800',
    message:
      'The student has been notified. You will be alerted once an appointment is booked.',
  },
  terminal: {
    bg: 'gray.50',
    borderColor: 'gray.200',
    textColor: 'gray.700',
    message: 'No further student notifications are expected for this claim.',
  },
};

export function StudentNotificationCard({
  mode,
}: StudentNotificationCardProps) {
  const style = copyByMode[mode];

  return (
    <Box
      bg={style.bg}
      borderWidth="1px"
      borderColor={style.borderColor}
      borderRadius="lg"
      p={4}
    >
      <Text fontSize="sm" fontWeight="semibold" color={style.textColor} mb={1}>
        Student Notification
      </Text>
      <Text fontSize="sm" color={style.textColor}>
        {style.message}
      </Text>
    </Box>
  );
}
