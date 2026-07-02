'use client';

import { Box, Flex, Stack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export interface DashboardMetricCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: ReactNode;
  accentColor: string;
  iconBg: string;
}

export function DashboardMetricCard({
  title,
  value,
  subtitle,
  icon,
  accentColor,
  iconBg,
}: DashboardMetricCardProps) {
  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="lg"
      px={5}
      py={5}
      h="full"
      minW={0}
    >
      <Flex align="center" gap={4}>
        <Flex
          align="center"
          justify="center"
          w={14}
          h={14}
          borderRadius="full"
          bg={iconBg}
          color={accentColor}
          flexShrink={0}
        >
          {icon}
        </Flex>

        <Stack gap={0.5} flex={1} minW={0}>
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            {title}
          </Text>
          <Text
            fontSize="3xl"
            fontWeight="bold"
            color="gray.900"
            lineHeight="1.1"
          >
            {value}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {subtitle}
          </Text>
        </Stack>
      </Flex>
    </Box>
  );
}
