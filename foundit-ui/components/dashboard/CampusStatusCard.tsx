'use client';

import {
  Box,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Spinner,
  Text,
  chakra,
} from '@chakra-ui/react';
import type { Campus, CategoryStat } from '@/types/items';
import { ClaimCategoryStat } from './ClaimCategoryStat';

const Select = chakra('select');

export interface CampusStatusCardProps {
  campuses: Campus[];
  selectedCampusId: string;
  onCampusChange: (campusId: string) => void;
  /** Placeholder until claims API is wired up. */
  totalClaims: number;
  categoryStats: CategoryStat[];
  loading?: boolean;
  error?: string;
}

export function CampusStatusCard({
  campuses,
  selectedCampusId,
  onCampusChange,
  totalClaims,
  categoryStats,
  loading = false,
  error = '',
}: CampusStatusCardProps) {
  return (
    <Box
      bg="gray.100"
      borderRadius="lg"
      px={{ base: 5, md: 8 }}
      py={{ base: 6, md: 8 }}
      w="full"
    >
      <Flex
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', sm: 'flex-end' }}
        gap={4}
        mb={6}
      >
        <Heading
          as="h2"
          fontSize={{ base: 'lg', md: 'xl' }}
          fontWeight="bold"
          color="blue.900"
        >
          Lost &amp; Found Status
        </Heading>

        <HStack
          gap={3}
          ml={{ base: 0, sm: 'auto' }}
          alignSelf={{ base: 'flex-end', sm: 'auto' }}
          flexShrink={0}
        >
          <chakra.label
            htmlFor="campus-select"
            fontSize="sm"
            fontWeight="medium"
            color="gray.600"
            whiteSpace="nowrap"
          >
            Campus
          </chakra.label>
          <Select
            id="campus-select"
            value={selectedCampusId}
            onChange={(e) => onCampusChange(e.target.value)}
            minW="160px"
            h={10}
            px={3}
            fontSize="sm"
            bg="white"
            borderWidth="1px"
            borderColor="#D9D9D9"
            borderRadius="md"
            color="#1a1a1a"
            _focusVisible={{
              outline: 'none',
              boxShadow: '0 0 0 2px #009adb',
            }}
          >
            <option value="">All campuses</option>
            {campuses.map((campus) => (
              <option key={campus.campusId} value={campus.campusId}>
                {campus.campusName}
              </option>
            ))}
          </Select>
        </HStack>
      </Flex>

      <Flex
        bg="blue.600"
        color="white"
        borderRadius="md"
        px={6}
        py={4}
        justify="space-between"
        align="center"
        mb={6}
      >
        <Text fontSize="md" fontWeight="semibold">
          Total Claims
        </Text>
        <Text fontSize="2xl" fontWeight="bold">
          {totalClaims}
        </Text>
      </Flex>

      <Box borderTopWidth="1px" borderColor="gray.300" pt={6}>
        {loading ? (
          <Box
            minH="120px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Spinner size="lg" color="blue.500" />
          </Box>
        ) : error ? (
          <Text color="red.600" fontSize="sm" textAlign="center" py={8}>
            {error}
          </Text>
        ) : categoryStats.length === 0 ? (
          <Text color="gray.600" fontSize="sm" textAlign="center" py={8}>
            No found items in storage.
          </Text>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
            {categoryStats.map((stat) => (
              <ClaimCategoryStat key={stat.category} {...stat} />
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
}
