'use client';

import { useEffect, useState } from 'react';
import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import SecurityFoundItemReportForm from '@/components/SecurityFoundItemReportForm';
import { fetchCampuses } from '@/lib/api/items';
import type { Campus } from '@/types/items';
import { getLoggedInUser } from '@/utils/auth';

export default function SecurityReportFoundPage() {
  const loggedInUser = getLoggedInUser();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [defaultCampusId, setDefaultCampusId] = useState(
    loggedInUser?.campusId ?? ''
  );
  const [campusesLoading, setCampusesLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadCampuses() {
      setCampusesLoading(true);
      try {
        const data = await fetchCampuses();
        if (!active) return;

        setCampuses(data);

        const userCampusId = loggedInUser?.campusId;
        if (
          userCampusId &&
          data.some((campus) => campus.campusId === userCampusId)
        ) {
          setDefaultCampusId(userCampusId);
        } else if (data.length > 0) {
          setDefaultCampusId(data[0].campusId);
        }
      } catch {
        if (active) {
          setLoadError(
            'Failed to load campuses. Please refresh and try again.'
          );
        }
      } finally {
        if (active) setCampusesLoading(false);
      }
    }

    loadCampuses();

    return () => {
      active = false;
    };
  }, [loggedInUser?.campusId]);

  return (
    <Flex direction="column" align="center" w="full">
      <Stack gap={6} w="full" maxW="720px">
        <Stack gap={2} textAlign="center" px={{ base: 0, md: 4 }}>
          <Heading
            as="h1"
            fontSize={{ base: '2xl', md: '3xl' }}
            fontWeight="bold"
            color="gray.900"
          >
            Report Found Item
          </Heading>
          <Text fontSize="sm" color="gray.600" maxW="560px" mx="auto">
            Register an item turned in to lost &amp; found. Provide as much
            detail as possible to help with identification and return.
          </Text>
        </Stack>

        {loadError && (
          <Box
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
            rounded="md"
            px={4}
            py={3}
            color="red.700"
            fontSize="sm"
            textAlign="center"
          >
            {loadError}
          </Box>
        )}

        <SecurityFoundItemReportForm
          campuses={campuses}
          defaultCampusId={defaultCampusId}
          campusesLoading={campusesLoading}
        />
      </Stack>
    </Flex>
  );
}
