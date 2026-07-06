'use client';

import { useState } from 'react';
import {
  Badge,
  Box,
  Button as ChakraButton,
  Flex,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import type { MatchSuggestion, SecurityClaimListItem } from '@/types/claims';
import { buildManualSearchHref } from '@/utils/claimDisplay';
import { Button } from '@/components/ui/Button';
import { ClaimCard } from './ClaimCard';
import { ClaimMatchCard } from './ClaimMatchCard';
import { ClaimMatchEmptyState } from './ClaimMatchEmptyState';

type MatchPanelVariant = 'awaiting' | 'review';

interface ClaimMatchPanelProps {
  claim: SecurityClaimListItem;
  variant: MatchPanelVariant;
  suggestions: MatchSuggestion[];
  selectedMatchId: string | null;
  onSelectMatch: (matchId: string) => void;
}

const tabStyles = {
  px: 4,
  py: 2,
  fontSize: 'sm',
  fontWeight: 'medium',
  borderRadius: 'md',
  cursor: 'pointer',
} as const;

export function ClaimMatchPanel({
  claim,
  variant,
  suggestions,
  selectedMatchId,
  onSelectMatch,
}: ClaimMatchPanelProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>(
    variant === 'awaiting' ? 'manual' : 'ai'
  );

  const manualHref = buildManualSearchHref(claim);
  const showReviewActions = variant === 'review';

  return (
    <ClaimCard>
      <Flex
        justify="space-between"
        align="center"
        mb={4}
        flexWrap="wrap"
        gap={2}
      >
        <Heading as="h2" fontSize="lg" fontWeight="bold" color="gray.900">
          Matching
        </Heading>
        {variant === 'review' ? (
          <Badge colorPalette="blue" variant="subtle">
            {suggestions.length} Match{suggestions.length === 1 ? '' : 'es'}{' '}
            Found
          </Badge>
        ) : null}
      </Flex>

      <Flex
        gap={2}
        mb={4}
        borderBottomWidth="1px"
        borderColor="gray.200"
        pb={2}
      >
        <ChakraButton
          {...tabStyles}
          variant="ghost"
          bg={activeTab === 'ai' ? 'gray.100' : 'transparent'}
          color={activeTab === 'ai' ? 'gray.900' : 'gray.600'}
          onClick={() => setActiveTab('ai')}
        >
          AI Matches ({suggestions.length})
        </ChakraButton>
        <ChakraButton
          {...tabStyles}
          variant="ghost"
          bg={activeTab === 'manual' ? 'gray.100' : 'transparent'}
          color={activeTab === 'manual' ? 'gray.900' : 'gray.600'}
          onClick={() => setActiveTab('manual')}
        >
          Manual Search
        </ChakraButton>
      </Flex>

      {activeTab === 'ai' ? (
        variant === 'awaiting' || suggestions.length === 0 ? (
          <ClaimMatchEmptyState />
        ) : (
          <Stack gap={3}>
            {suggestions.map((match, index) => (
              <ClaimMatchCard
                key={match.matchId}
                match={match}
                rank={index + 1}
                isBestMatch={index === 0}
                selected={selectedMatchId === match.matchId}
                onSelect={() => onSelectMatch(match.matchId)}
              />
            ))}
          </Stack>
        )
      ) : (
        <Box py={8} px={4} textAlign="center">
          <Stack gap={4} align="center">
            <Text fontSize="sm" color="gray.600" maxW="md">
              Search stored items on campus to find a potential match manually.
              Filters are pre-filled from this claim when possible.
            </Text>
            <Button asChild variant="primary">
              <NextLink href={manualHref}>Browse stored items</NextLink>
            </Button>
          </Stack>
        </Box>
      )}

      {showReviewActions ? (
        <Flex
          mt={6}
          pt={4}
          borderTopWidth="1px"
          borderColor="gray.200"
          gap={3}
          flexWrap="wrap"
          justify="flex-end"
          align="center"
        >
          <Button variant="outline" disabled title="Coming soon">
            Not a Match
          </Button>
          <Button variant="muted" disabled title="Coming soon">
            Request More Info
          </Button>
          <Button variant="primary" disabled title="Confirm match coming soon">
            Confirm Match
          </Button>
        </Flex>
      ) : (
        <Flex mt={6} pt={4} borderTopWidth="1px" borderColor="gray.200" gap={3}>
          <Button variant="outline" disabled title="Coming soon">
            Not a Match
          </Button>
        </Flex>
      )}
    </ClaimCard>
  );
}
