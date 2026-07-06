'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Spinner,
  Stack,
  Text,
  chakra,
} from '@chakra-ui/react';
import QRCode from 'react-qr-code';
import { fetchCampuses } from '@/lib/api/items';
import { createReportLink } from '@/lib/api/reportLinks';
import type { Campus } from '@/types/items';
import { getLoggedInUser } from '@/utils/auth';

const Select = chakra('select');

interface GeneratedLink {
  token: string;
  url: string;
  expiresAt: string;
  campusName: string;
}

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')} min`;
}

function buildReportUrl(token: string, reportUrl?: string): string {
  if (reportUrl) return reportUrl;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/report-found/${token}`;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap={1}>
      <Text fontSize="sm" fontWeight="semibold" color="gray.600">
        {label}
      </Text>
      <Input
        value={value}
        readOnly
        h={12}
        px={4}
        fontSize="md"
        bg="white"
        borderColor="gray.300"
        color="gray.800"
        cursor="default"
        _focusVisible={{ outline: 'none', boxShadow: 'none' }}
      />
    </Stack>
  );
}

export default function GenerateQrPage() {
  const loggedInUser = getLoggedInUser();

  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [campusId, setCampusId] = useState('');
  const [generated, setGenerated] = useState<GeneratedLink | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [loadingCampuses, setLoadingCampuses] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');

  useEffect(() => {
    let active = true;

    async function loadCampuses() {
      setLoadingCampuses(true);
      try {
        const data = await fetchCampuses();
        if (!active) return;
        setCampuses(data);

        const userCampusId = loggedInUser?.campusId;
        if (
          userCampusId &&
          data.some((campus) => campus.campusId === userCampusId)
        ) {
          setCampusId(userCampusId);
        } else if (data.length > 0) {
          setCampusId(data[0].campusId);
        }
      } catch {
        if (active) {
          setError('Failed to load campuses.');
        }
      } finally {
        if (active) setLoadingCampuses(false);
      }
    }

    loadCampuses();
    return () => {
      active = false;
    };
  }, [loggedInUser?.campusId]);

  const selectedCampusName = useMemo(() => {
    return (
      campuses.find((campus) => campus.campusId === campusId)?.campusName ?? ''
    );
  }, [campuses, campusId]);

  useEffect(() => {
    if (!generated) return;

    const expiresAtMs = new Date(generated.expiresAt).getTime();

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.floor((expiresAtMs - Date.now()) / 1000)
      );
      setRemainingSeconds(remaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [generated]);

  const handleGenerate = useCallback(async () => {
    setError('');
    setCopyFeedback('');
    setGenerating(true);

    try {
      const result = await createReportLink(
        campusId ? { campusId } : undefined
      );

      const campusName =
        campuses.find((campus) => campus.campusId === result.campusId)
          ?.campusName ?? selectedCampusName;

      setGenerated({
        token: result.token,
        url: buildReportUrl(result.token, result.reportUrl),
        expiresAt: result.expiresAt,
        campusName,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate report link.'
      );
    } finally {
      setGenerating(false);
    }
  }, [campuses, campusId, selectedCampusName]);

  const handleCopyLink = async () => {
    if (!generated?.url) return;

    try {
      await navigator.clipboard.writeText(generated.url);
      setCopyFeedback('Copied!');
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch {
      setCopyFeedback('Copy failed');
    }
  };

  const handleGenerateNew = () => {
    setGenerated(null);
    setCopyFeedback('');
    setError('');
  };

  const canGenerate = !loadingCampuses && !generating && Boolean(campusId);

  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <Heading
          as="h1"
          fontSize={{ base: '2xl', md: '3xl' }}
          fontWeight="bold"
          color="gray.900"
        >
          Generate QR code
        </Heading>
        <Text fontSize="sm" color="gray.500">
          Generate a one-time link for a student to report a found item. The
          student must log in to submit.
        </Text>
      </Stack>

      {!generated ? (
        <Box
          maxW="480px"
          mx="auto"
          w="full"
          bg="gray.100"
          borderRadius="lg"
          p={{ base: 6, md: 8 }}
        >
          <Stack gap={5}>
            <Stack gap={1}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                Campus
              </Text>
              {loadingCampuses ? (
                <Flex align="center" gap={2} py={3}>
                  <Spinner size="sm" color="blue.500" />
                  <Text fontSize="sm" color="gray.500">
                    Loading campuses…
                  </Text>
                </Flex>
              ) : (
                <Select
                  value={campusId}
                  onChange={(e) => setCampusId(e.target.value)}
                  h={12}
                  px={4}
                  fontSize="md"
                  bg="white"
                  borderColor="gray.300"
                  borderRadius="md"
                  _focusVisible={{
                    outline: '2px solid',
                    outlineColor: 'blue.500',
                  }}
                >
                  {campuses.map((campus) => (
                    <option key={campus.campusId} value={campus.campusId}>
                      {campus.campusName}
                    </option>
                  ))}
                </Select>
              )}
            </Stack>

            {error && (
              <Text fontSize="sm" color="red.600">
                {error}
              </Text>
            )}

            <Button
              w="full"
              h={12}
              bg="blue.500"
              color="white"
              fontSize="md"
              fontWeight="semibold"
              borderRadius="md"
              _hover={{ bg: 'blue.600' }}
              _disabled={{ bg: 'blue.300', cursor: 'not-allowed' }}
              disabled={!canGenerate}
              loading={generating}
              loadingText="Generating…"
              onClick={handleGenerate}
            >
              Generate QR Code
            </Button>
          </Stack>
        </Box>
      ) : (
        <Flex direction={{ base: 'column', lg: 'row' }} gap={6} align="stretch">
          <Box flex={1} bg="gray.100" borderRadius="lg" p={{ base: 6, md: 8 }}>
            <Stack gap={5}>
              <ReadOnlyField label="Campus" value={generated.campusName} />
              <Button
                w="full"
                h={12}
                bg="gray.400"
                color="white"
                fontSize="md"
                fontWeight="semibold"
                borderRadius="md"
                _hover={{ bg: 'gray.500' }}
                loading={generating}
                loadingText="Generating…"
                onClick={handleGenerate}
              >
                Generate new link
              </Button>
              <Button
                w="full"
                h={12}
                variant="outline"
                borderColor="gray.300"
                fontSize="md"
                fontWeight="semibold"
                borderRadius="md"
                onClick={handleGenerateNew}
              >
                Back
              </Button>
            </Stack>
          </Box>

          <Box
            flex={1}
            bg="blue.50"
            borderRadius="lg"
            p={{ base: 6, md: 8 }}
            position="relative"
          >
            <Text
              position="absolute"
              top={4}
              right={4}
              fontSize="sm"
              fontWeight="semibold"
              color="blue.600"
            >
              {remainingSeconds > 0
                ? `Expire in ${formatCountdown(remainingSeconds)}`
                : 'Expired'}
            </Text>

            <Stack gap={6} pt={{ base: 8, md: 4 }}>
              <Stack gap={3} align="center">
                <Heading
                  as="h2"
                  fontSize="lg"
                  fontWeight="bold"
                  color="gray.900"
                >
                  QR Code
                </Heading>
                <Box bg="white" p={4} borderRadius="md" boxShadow="sm">
                  <QRCode
                    value={generated.url}
                    size={180}
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  />
                </Box>
              </Stack>

              <Stack gap={2}>
                <Flex justify="space-between" align="center">
                  <Heading
                    as="h2"
                    fontSize="lg"
                    fontWeight="bold"
                    color="gray.900"
                  >
                    Link
                  </Heading>
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="blue.300"
                    color="blue.700"
                    onClick={handleCopyLink}
                  >
                    {copyFeedback || 'Copy link'}
                  </Button>
                </Flex>
                <Text
                  fontSize="sm"
                  color="blue.700"
                  wordBreak="break-all"
                  bg="white"
                  px={4}
                  py={3}
                  borderRadius="md"
                >
                  {generated.url}
                </Text>
              </Stack>

              {error && (
                <Text fontSize="sm" color="red.600">
                  {error}
                </Text>
              )}
            </Stack>
          </Box>
        </Flex>
      )}
    </Stack>
  );
}
