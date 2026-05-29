'use client';

import { Heading, Stack, Text } from '@chakra-ui/react';
import { MOCK_STUDENT_DISPLAY_NAME } from '@/constants/mockSession';

export default function StudentDashboardPage() {
  return (
    <Stack gap={4}>
      <Heading
        as="h1"
        fontSize={{ base: '2xl', md: '3xl' }}
        fontWeight="bold"
        color="blue.900"
      >
        Hello, {MOCK_STUDENT_DISPLAY_NAME}
      </Heading>
      <Text color="gray.600" fontSize="md">
        Your claims and matched found items will appear here.
      </Text>
    </Stack>
  );
}
