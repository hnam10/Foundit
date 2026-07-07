'use client';

import { Badge, Box, Flex, Grid, Stack, Text, chakra } from '@chakra-ui/react';
import { IoImageOutline } from 'react-icons/io5';
import type { MatchSuggestion } from '@/types/claims';
import { formatClaimDate } from '@/utils/claimDisplay';

const RadioInput = chakra('input');

function formatItemId(itemId: string): string {
  return itemId.slice(0, 8).toUpperCase();
}

interface ClaimMatchCardProps {
  match: MatchSuggestion;
  rank: number;
  isBestMatch: boolean;
  selected: boolean;
  onSelect: () => void;
}

export function ClaimMatchCard({
  match,
  rank,
  isBestMatch,
  selected,
  onSelect,
}: ClaimMatchCardProps) {
  const { item } = match;
  const scoreLabel = `${Math.round(match.matchScore)}% Match`;

  return (
    <Box
      borderWidth="2px"
      borderColor={selected ? 'blue.500' : 'gray.200'}
      borderRadius="lg"
      p={4}
      bg={selected ? 'blue.50' : 'white'}
      cursor="pointer"
      onClick={onSelect}
      transition="border-color 0.15s, background 0.15s"
      _hover={{ borderColor: selected ? 'blue.500' : 'gray.300' }}
    >
      <Flex justify="space-between" align="start" mb={3} gap={2}>
        <Flex align="center" gap={2}>
          <Text fontSize="sm" fontWeight="bold" color="gray.700">
            {rank}
          </Text>
          {isBestMatch ? (
            <Badge colorPalette="green" variant="subtle" fontSize="xs">
              Best Match
            </Badge>
          ) : null}
          <Badge colorPalette="green" variant="outline" fontSize="xs">
            {scoreLabel}
          </Badge>
        </Flex>
        <RadioInput
          type="radio"
          name="claim-match"
          checked={selected}
          onChange={onSelect}
          accentColor="var(--chakra-colors-blue-500)"
        />
      </Flex>

      <Grid templateColumns="80px 1fr" gap={3} alignItems="start">
        <Flex
          w="80px"
          h="80px"
          borderRadius="md"
          bg="gray.100"
          align="center"
          justify="center"
          color="gray.400"
          fontSize="2xl"
          flexShrink={0}
        >
          <IoImageOutline />
        </Flex>
        <Stack gap={1}>
          <Text fontSize="xs" color="gray.500">
            {item.category}
          </Text>
          <Text fontSize="sm" fontWeight="semibold" color="gray.900">
            {item.title}
          </Text>
          <Text fontSize="xs" color="gray.600">
            Item ID: {formatItemId(item.itemId)}
          </Text>
          <Text fontSize="xs" color="gray.600">
            Found: {formatClaimDate(item.dateFound)}
            {item.locationFound ? ` · ${item.locationFound}` : ''}
          </Text>
        </Stack>
      </Grid>
    </Box>
  );
}
