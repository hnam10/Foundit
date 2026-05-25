'use client';

import { Box, Circle, Flex, HStack, Text, VStack } from '@chakra-ui/react';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * The three lifecycle states a claim can be in.
 * Each maps to a distinct strip color and label (see statusConfig below).
 */
export type ClaimStatus = 'pending' | 'approved' | 'rejected';

/**
 * Props for NotificationCard.
 *
 * @param id           - Unique claim identifier shown as "Claim: #<id>"
 * @param categoryName - The category the lost item belongs to (e.g. "Electronics")
 * @param itemName     - The specific item name (e.g. "MacBook Pro")
 * @param status       - Current claim status; controls strip color and label
 * @param date         - Human-readable date the claim was made (e.g. "May 24, 2026")
 */
interface NotificationCardProps {
  id: string | number;
  categoryName: string;
  itemName: string;
  status: ClaimStatus;
  date: string;
}

// ─── Status config ────────────────────────────────────────────────────────────

/**
 * Drives all status-dependent visuals from one place.
 *
 * strip — color of the 4px left border accent
 * label — human-readable status text shown on the right
 * color — text color for the label (darker shade for readability on white)
 *
 * To add a new status: extend ClaimStatus above and add an entry here.
 */
const statusConfig: Record<ClaimStatus, { strip: string; label: string; color: string }> = {
  pending:  { strip: '#f59e0b', label: 'Pending',  color: '#92400e' },
  approved: { strip: '#22c55e', label: 'Approved', color: '#14532d' },
  rejected: { strip: '#ef4444', label: 'Rejected', color: '#7f1d1d' },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * NotificationCard
 *
 * Displays a single claim notification as a horizontal card. Layout:
 *
 *   ┌──────────────────────────────────────────────────────────┐
 *   │▌  ●  Category | Item Name              Status Label      │
 *   │▌     Claim: #id                        Date              │
 *   └──────────────────────────────────────────────────────────┘
 *
 * - The colored left strip (▌) reflects the claim status.
 * - The circle (●) is a neutral icon placeholder — swap it for an
 *   actual icon or image once assets are available.
 * - The card uses w="full" so it always stretches to fill its parent.
 *   Wrap it in any Box/container to control its width.
 */
export function NotificationCard({
  id,
  categoryName,
  itemName,
  status,
  date,
}: NotificationCardProps) {
  const { strip, label, color } = statusConfig[status];

  return (
    <Flex
      w="full"
      bg="white"
      borderRadius="md"
      boxShadow="sm"
      borderWidth="1px"
      borderColor="gray.200"
      overflow="hidden"
      align="stretch"
    >
      {/* Left status strip — color is driven by statusConfig[status].strip */}
      <Box w="4px" bg={strip} flexShrink={0} />

      {/* Main content row */}
      <HStack flex={1} px={4} py={3} justify="space-between" align="center">

        {/* Left section: icon placeholder + claim details */}
        <HStack gap={3} align="center">
          {/* Neutral circle — replace with <Image> or an icon component when ready */}
          <Circle size="36px" bg="gray.100" flexShrink={0} />

          <VStack align="start" gap={0}>
            {/* Primary line: category and item name */}
            <Text fontWeight="semibold" fontSize="sm" color="gray.800">
              {categoryName} | {itemName}
            </Text>

            {/* Secondary line: unique claim reference */}
            <Text fontSize="xs" color="gray.500">
              Claim: #{id}
            </Text>
          </VStack>
        </HStack>

        {/* Right section: status label + date */}
        <VStack align="end" gap={0}>
          {/* Status text color matches the strip color (darker shade) */}
          <Text fontSize="sm" fontWeight="semibold" color={color}>
            {label}
          </Text>
          <Text fontSize="xs" color="gray.400">
            {date}
          </Text>
        </VStack>

      </HStack>
    </Flex>
  );
}
