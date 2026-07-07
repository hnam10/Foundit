'use client';

import { useEffect, useState } from 'react';
import { Box, Heading, Spinner, Stack, Text } from '@chakra-ui/react';
import { ClaimCard } from '@/components/ClaimCard';
import { fetchAllClaims } from '@/lib/api/claims';
import { ClaimDetailModal } from '@/components/StudentClaimDetailModal';
import type { SecurityClaimListItem } from '@/types/claims';
import { getAccessToken } from '@/utils/auth';

export default function StudentMyClaimsPage() {
  const isLoggedIn = !!getAccessToken();

  const [claims, setClaims] = useState<SecurityClaimListItem[]>([]);
  const [loading, setLoading] = useState(isLoggedIn);
  const [error, setError] = useState('');
  const [selectedClaim, setSelectedClaim] =
    useState<SecurityClaimListItem | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    async function loadClaims() {
      try {
        const data = await fetchAllClaims();
        setClaims(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load your claims.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadClaims();
  }, [isLoggedIn]);

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
          <Heading as="h1" fontSize="40px" fontWeight="700">
            My Claims
          </Heading>
        </Box>

        <Box bg="white" borderRadius="lg" p={{ base: 5, md: 8 }} minH="420px">
          {!isLoggedIn && (
            <Text color="red.600" textAlign="center">
              You must be logged in as a student to view your claims.
            </Text>
          )}

          {isLoggedIn && loading && (
            <Box display="flex" justifyContent="center" py={16}>
              <Spinner size="xl" color="blue.500" />
            </Box>
          )}

          {isLoggedIn && !loading && error && (
            <Text color="red.500" textAlign="center">
              {error}
            </Text>
          )}

          {isLoggedIn && !loading && !error && claims.length === 0 && (
            <Text color="gray.500" textAlign="center">
              You do not have any claims yet.
            </Text>
          )}

          {isLoggedIn && !loading && !error && claims.length > 0 && (
            <Stack gap={5}>
              {claims.map((claim) => (
                <Box
                  key={claim.claimId}
                  cursor="pointer"
                  onClick={() => {
                    setSelectedClaim(null);

                    setTimeout(() => {
                      setSelectedClaim(claim);
                    }, 0);
                  }}
                >
                  <ClaimCard claim={claim} />
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
      {selectedClaim && (
        <ClaimDetailModal
          claim={selectedClaim}
          isOpen={selectedClaim !== null}
          onClose={() => setSelectedClaim(null)}
          onCancelled={(claimId) => {
            setClaims((prev) => prev.filter((c) => c.claimId !== claimId));
          }}
        />
      )}
    </Box>
  );
}
