'use client';

import { useState } from 'react';
import { Button as ChakraButton, Flex, Stack } from '@chakra-ui/react';
import type { MatchSuggestion, SecurityClaimListItem } from '@/types/claims';
import { Button } from '@/components/ui/Button';
import { ClaimCard } from './ClaimCard';
import { ClaimManualSearchList } from './ClaimManualSearchList';
import { ClaimMatchCard } from './ClaimMatchCard';
import { ClaimMatchEmptyState } from './ClaimMatchEmptyState';

type MatchPanelVariant = 'awaiting' | 'review';

interface ClaimMatchPanelProps {
  claim: SecurityClaimListItem;
  variant: MatchPanelVariant;
  suggestions: MatchSuggestion[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
  onConfirmMatch: () => void | Promise<void>;
  generating?: boolean;
  confirming?: boolean;
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
  selectedItemId,
  onSelectItem,
  onConfirmMatch,
  generating = false,
  confirming = false,
}: ClaimMatchPanelProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');

  const canConfirm = Boolean(selectedItemId);
  const showMatchActions = variant === 'review' || canConfirm;

  return (
    <ClaimCard>
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
          AI Matches
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
        suggestions.length > 0 ? (
          <Stack gap={3}>
            {suggestions.map((match, index) => (
              <ClaimMatchCard
                key={match.matchId}
                match={match}
                rank={index + 1}
                isBestMatch={index === 0}
                selected={selectedItemId === match.itemId}
                onSelect={() => onSelectItem(match.itemId)}
              />
            ))}
          </Stack>
        ) : (
          <ClaimMatchEmptyState searching={generating} />
        )
      ) : (
        <ClaimManualSearchList
          claim={claim}
          selectedItemId={selectedItemId}
          onSelectItem={onSelectItem}
        />
      )}

      {showMatchActions ? (
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
          {variant === 'review' ? (
            <Button variant="muted" disabled title="Coming soon">
              Request More Info
            </Button>
          ) : null}
          <Button
            variant="primary"
            disabled={!canConfirm || confirming}
            loading={confirming}
            onClick={() => void onConfirmMatch()}
          >
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
