'use client';

import { useEffect, useState } from 'react';
import { Heading, Stack } from '@chakra-ui/react';
import { CampusStatusCard } from '@/components/dashboard/CampusStatusCard';
import { MOCK_SECURITY_DISPLAY_NAME } from '@/constants/mockSession';
import { useLoggedInDisplayName } from '@/hooks/useLoggedInDisplayName';
import { fetchCampuses, fetchCategoryStats } from '@/lib/api/items';
import type { Campus, CategoryStat } from '@/types/items';

/** Placeholder until claims API is wired up. */
const PLACEHOLDER_TOTAL_CLAIMS = 9;

export default function SecurityDashboardPage() {
  const displayName = useLoggedInDisplayName(MOCK_SECURITY_DISPLAY_NAME);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [campusesLoaded, setCampusesLoaded] = useState(false);
  const [selectedCampusId, setSelectedCampusId] = useState('');
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadCampuses() {
      try {
        const data = await fetchCampuses();
        if (!active) return;

        setCampuses(data);
      } catch {
        // Campus filter is optional; stats can still load for all campuses.
      } finally {
        if (active) setCampusesLoaded(true);
      }
    }

    loadCampuses();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!campusesLoaded) return;

    let active = true;

    async function loadCategoryStats() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchCategoryStats(selectedCampusId || undefined);
        if (!active) return;

        setCategoryStats(data);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : 'Failed to load found items.'
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
  }, [selectedCampusId, campusesLoaded]);

  return (
    <Stack gap={8}>
      <Heading
        as="h1"
        fontSize={{ base: '2xl', md: '3xl' }}
        fontWeight="bold"
        color="blue.900"
        textAlign="center"
        w="full"
      >
        Hello, {displayName}
      </Heading>

      <CampusStatusCard
        campuses={campuses}
        selectedCampusId={selectedCampusId}
        onCampusChange={setSelectedCampusId}
        totalClaims={PLACEHOLDER_TOTAL_CLAIMS}
        categoryStats={categoryStats}
        loading={loading}
        error={error}
      />
    </Stack>
  );
}
