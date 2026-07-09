'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  NativeSelect,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useLoggedInDisplayName } from '@/hooks/useLoggedInDisplayName';
import { fetchCampuses, fetchCategoryStats } from '@/lib/api/items';
import { ApiError } from '@/lib/api/client';
import type { Campus, CategoryStat } from '@/types/items';
import { debugError } from '@/utils/debug';

export default function StudentDashboardPage() {
  const router = useRouter();
  const displayName = useLoggedInDisplayName();
  const [isNavigatingToClaim, setIsNavigatingToClaim] = useState(false);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [campusFilter, setCampusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadCampuses() {
      try {
        const data = await fetchCampuses();
        if (active) setCampuses(data);
      } catch {
        // Campus filter is optional; stats can still load for all campuses.
      }
    }

    loadCampuses();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadCategoryStats() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchCategoryStats(campusFilter || undefined);
        if (!active) return;

        setCategoryStats(data);
      } catch (err) {
        debugError('student-dashboard', 'category stats fetch failed', err);
        if (!active) return;
        setError(
          err instanceof ApiError && err.status === 0
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Unable to load found items right now. Please try again later.'
        );
        setCategoryStats([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCategoryStats();
    return () => {
      active = false;
    };
  }, [campusFilter]);

  const totalItems = useMemo(
    () => categoryStats.reduce((sum, stat) => sum + stat.count, 0),
    [categoryStats]
  );

  return (
    <Box
      mt="-40px"
      mb="-40px"
      minH="100vh"
      w="100vw"
      maxW="none"
      mx="calc(50% - 50vw)"
      backgroundImage="url('/bg.svg')"
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      px={{ base: 4, md: 10 }}
      py={10}
    >
      <Stack gap={6} maxW="1100px" mx="auto">
        <Box textAlign="center" color="white">
          <Text fontSize="24px" fontWeight="700" lineHeight="36px" mb={2}>
            Found item dash board
          </Text>
          <Heading as="h1" fontSize="40px" fontWeight="700" lineHeight="48px">
            Hello{displayName ? `, ${displayName}` : ''}
          </Heading>
        </Box>

        <Box bg="white" borderRadius="lg" p={{ base: 5, md: 8 }}>
          <HStack
            justify="space-between"
            align="center"
            mb={4}
            flexWrap="wrap"
            gap={4}
          >
            <Text fontSize="sm" color="gray.600">
              {loading
                ? 'Loading found items…'
                : `${totalItems} item${totalItems === 1 ? '' : 's'} in storage`}
            </Text>

            <NativeSelect.Root w="190px">
              <NativeSelect.Field
                aria-label="Filter by campus"
                value={campusFilter}
                onChange={(event) => setCampusFilter(event.target.value)}
                fontSize="sm"
              >
                <option value="">All campuses</option>
                {campuses.map((campus) => (
                  <option key={campus.campusId} value={campus.campusId}>
                    {campus.campusName}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </HStack>

          <Box
            bg="gray.100"
            borderRadius="md"
            p={{ base: 4, md: 8 }}
            minH="230px"
          >
            {loading ? (
              <Box
                minH="180px"
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
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
                {categoryStats.map((stat) => (
                  <Flex
                    key={stat.category}
                    bg="blue.50"
                    borderRadius="md"
                    px={4}
                    py={3}
                    justify="space-between"
                    align="center"
                    gap={3}
                  >
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="blue.500"
                      lineClamp={2}
                    >
                      {stat.category}
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" flexShrink={0}>
                      {stat.count}
                    </Text>
                  </Flex>
                ))}
              </SimpleGrid>
            )}
          </Box>
        </Box>

        <Button
          bg="blue.500"
          color="white"
          size="lg"
          w="220px"
          alignSelf="center"
          _hover={{ bg: 'blue.600' }}
          loading={isNavigatingToClaim}
          onClick={() => {
            setIsNavigatingToClaim(true);
            router.push('/student/claim-item');
          }}
        >
          Claim Items
        </Button>
      </Stack>
    </Box>
  );
}
