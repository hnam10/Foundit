'use client';

import { Badge, Box, Flex, Stack, Text } from '@chakra-ui/react';
import { IoCheckmark, IoEllipseOutline } from 'react-icons/io5';
import type { ClaimWorkflowStep } from '@/utils/claimDisplay';
import { formatClaimDateTime } from '@/utils/claimDisplay';
import { ClaimCard } from './ClaimCard';

interface ClaimStatusStepperProps {
  steps: ClaimWorkflowStep[];
}

function StepIcon({ state }: { state: ClaimWorkflowStep['state'] }) {
  if (state === 'complete') {
    return (
      <Flex
        w="28px"
        h="28px"
        borderRadius="full"
        bg="green.500"
        color="white"
        align="center"
        justify="center"
        flexShrink={0}
      >
        <IoCheckmark size={16} />
      </Flex>
    );
  }

  if (state === 'active') {
    return (
      <Flex
        w="28px"
        h="28px"
        borderRadius="full"
        borderWidth="2px"
        borderColor="blue.500"
        bg="blue.50"
        align="center"
        justify="center"
        flexShrink={0}
      >
        <Box w="10px" h="10px" borderRadius="full" bg="blue.500" />
      </Flex>
    );
  }

  return (
    <Flex
      w="28px"
      h="28px"
      borderRadius="full"
      borderWidth="2px"
      borderColor="gray.300"
      color="gray.400"
      align="center"
      justify="center"
      flexShrink={0}
    >
      <IoEllipseOutline size={14} />
    </Flex>
  );
}

export function ClaimStatusStepper({ steps }: ClaimStatusStepperProps) {
  return (
    <ClaimCard>
      <Text fontSize="lg" fontWeight="bold" color="gray.900" mb={5}>
        Claim Status
      </Text>
      <Stack gap={0}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;

          return (
            <Flex key={step.key} gap={3}>
              <Flex direction="column" align="center">
                <StepIcon state={step.state} />
                {!isLast ? (
                  <Box
                    w="2px"
                    flex={1}
                    minH="40px"
                    bg={step.state === 'complete' ? 'green.300' : 'gray.200'}
                    my={1}
                  />
                ) : null}
              </Flex>
              <Stack gap={1} pb={isLast ? 0 : 5} flex={1}>
                <Flex align="center" gap={2} flexWrap="wrap">
                  <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                    {step.label}
                  </Text>
                  {step.state === 'active' ? (
                    <Badge colorPalette="blue" variant="subtle" fontSize="xs">
                      Active
                    </Badge>
                  ) : null}
                  {step.state === 'pending' ? (
                    <Badge colorPalette="gray" variant="subtle" fontSize="xs">
                      Pending
                    </Badge>
                  ) : null}
                </Flex>
                <Text fontSize="xs" color="gray.600">
                  {step.description}
                </Text>
                {step.timestamp ? (
                  <Text fontSize="xs" color="gray.500">
                    {formatClaimDateTime(step.timestamp)}
                  </Text>
                ) : null}
              </Stack>
            </Flex>
          );
        })}
      </Stack>
    </ClaimCard>
  );
}
