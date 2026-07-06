'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Heading,
  HStack,
  NativeSelect,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useLoggedInDisplayName } from '@/hooks/useLoggedInDisplayName';
import { fetchCategoryStats, type CategoryStat } from '@/lib/api/items';
import { ApiError } from '@/lib/api/client';
import { debugError } from '@/utils/debug';

export default function StudentDashboardPage() {
  const router = useRouter();
  const displayName = useLoggedInDisplayName();
  // Keeps the Claim Items button in a spinner state while the route
  // transition to /student/claim-item is in flight (cleared on unmount).
  const [isNavigatingToClaim, setIsNavigatingToClaim] = useState(false);
  // Counts of claimable (stored) items per category, from the public
  // GET /api/items/category-stats endpoint.
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCategoryStats() {
      try {
        const stats = await fetchCategoryStats();
        if (active) setCategoryStats(stats);
      } catch (err) {
        debugError('student-dashboard', 'category stats fetch failed', err);
        if (active) {
          setStatsError(
            err instanceof ApiError && err.status === 0
              ? err.message
              : 'Unable to load found items right now. Please try again later.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCategoryStats();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <Box
        minH="50vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

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
        {/* Dashboard Header */}
        <Box textAlign="center" color="white">
          <Text fontSize="24px" fontWeight="700" lineHeight="36px" mb={2}>
            Found item dash board
          </Text>
          <Heading as="h1" fontSize="40px" fontWeight="700" lineHeight="48px">
            Hello{displayName ? `, ${displayName}` : ''}
          </Heading>
        </Box>

        {/* Main Dashboard Card */}
        <Box bg="white" borderRadius="lg" p={{ base: 5, md: 8 }}>
          {/* Filter Section */}
          <HStack justify="flex-end" gap={4} mb={4}>
            <NativeSelect.Root w="170px">
              <NativeSelect.Field>
                <option>Period</option>
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            <NativeSelect.Root w="190px">
              <NativeSelect.Field>
                <option>Campus Option</option>
                <option>Newnham</option>
                <option>Seneca@York</option>
                <option>King</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </HStack>

          {/* Found Items Display Area — one card per category with the
              number of stored (claimable) items in it. */}
          <Box
            bg="gray.100"
            borderRadius="md"
            p={{ base: 4, md: 8 }}
            minH="230px"
          >
            {statsError ? (
              <Text fontSize="sm" color="red.600">
                {statsError}
              </Text>
            ) : categoryStats.length === 0 ? (
              <Text fontSize="sm" color="fg.muted">
                No found items are available to claim right now.
              </Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
                {categoryStats.map((stat) => (
                  <HStack
                    key={stat.category}
                    bg="blue.50"
                    borderRadius="md"
                    px={4}
                    py={2}
                    justify="space-between"
                    fontSize="sm"
                  >
                    <Text as="span" color="blue.500" fontWeight="bold">
                      {stat.category}
                    </Text>
                    <Text color="blue.500" fontWeight="bold">
                      {stat.count}
                    </Text>
                  </HStack>
                ))}
              </SimpleGrid>
            )}
          </Box>
        </Box>

        {/* Claim Button */}
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
