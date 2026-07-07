'use client';

import { useState } from 'react';
import {
  Box,
  Dialog,
  Flex,
  IconButton,
  Button,
  Image,
  Text,
} from '@chakra-ui/react';

import { LuX } from 'react-icons/lu';
import type { SecurityClaimListItem } from '@/types/claims';
import { ClaimStatusProgress } from '@/components/ClaimStatusProgress';
import { deleteClaim } from '@/lib/api/claims';

type Props = {
  claim: SecurityClaimListItem | null;
  isOpen: boolean;
  onClose: () => void;
  /** Called after the claim is successfully cancelled, so the parent can
   * drop it from its list. */
  onCancelled?: (claimId: string) => void;
};

export function ClaimDetailModal({
  claim,
  isOpen,
  onClose,
  onCancelled,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  if (!isOpen || !claim) return null;

  const canCancel = claim.status === 'submitted';

  async function handleConfirmCancel() {
    if (!claim || cancelling) return;

    setCancelling(true);
    setCancelError('');
    try {
      await deleteClaim(claim.claimId);
      setConfirmOpen(false);
      onCancelled?.(claim.claimId);
      onClose();
    } catch (err) {
      setCancelError(
        err instanceof Error ? err.message : 'Failed to cancel claim.'
      );
    } finally {
      setCancelling(false);
    }
  }

  return (
    <Dialog.Root
      open={isOpen}
      lazyMount
      unmountOnExit
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content position="relative" maxW="900px" p={8}>
          <IconButton
            aria-label="Close"
            variant="ghost"
            size="sm"
            position="absolute"
            top={4}
            right={4}
            onClick={onClose}
          >
            <LuX />
          </IconButton>

          <Flex gap={6} align="center" mb={6}>
            <Text fontSize="2xl" fontWeight="bold">
              My Claim
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="gray.500">
              #{claim.claimId.slice(0, 5)}
            </Text>
          </Flex>

          <Flex gap={12}>
            <Box flex="1">
              <Text fontWeight="bold">Your Name</Text>
              <Text color="gray.500">
                {claim.student.firstName} {claim.student.lastName}
              </Text>

              <Text mt={4} fontWeight="bold">
                Student ID
              </Text>
              <Text color="gray.500">
                {claim.student.studentNumber ?? '-'}
              </Text>

              <Text mt={4} fontWeight="bold">
                Email Address
              </Text>
              <Text color="gray.500">{claim.student.email}</Text>

              <Text mt={4} fontWeight="bold">
                Item to Claim
              </Text>
              <Text color="gray.500">
                {claim.item?.category ?? claim.category},{' '}
                {claim.item?.title ?? claim.itemName ?? claim.description}
              </Text>
            </Box>

            <Box flex="1">
              <Text fontWeight="bold">Status</Text>
              <ClaimStatusProgress status={claim.status} />

              <Text mt={4} fontWeight="bold">
                Notification Preferences
              </Text>
              <Text color="gray.500">
                {claim.notificationPreference ?? '-'}
              </Text>

              <Text mt={4} fontWeight="bold">
                Campus Location
              </Text>
              <Text color="gray.500">{claim.campus?.campusName ?? '-'}</Text>
            </Box>
          </Flex>

          <Box mt={6}>
            <Text fontWeight="bold">Description</Text>
            <Box border="1px solid" borderColor="gray.200" p={4} mt={2}>
              {claim.description}
            </Box>
          </Box>

          <Box mt={6}>
            <Text fontWeight="bold">Additional Information</Text>
            <Box border="1px solid" borderColor="gray.200" p={4} mt={2}>
              {claim.additionalInfo ?? '-'}
            </Box>
          </Box>

          {claim.images.length > 0 && (
            <Box mt={6}>
              <Text fontWeight="bold">Proof of Ownership</Text>
              <Flex gap={3} mt={2} flexWrap="wrap">
                {claim.images.map((image) => (
                  <Image
                    key={image.imageId}
                    src={image.imageUrl}
                    alt={claim.itemName ?? 'Claim proof image'}
                    boxSize="150px"
                    objectFit="cover"
                  />
                ))}
              </Flex>
            </Box>
          )}

          {canCancel && (
            <Flex justify="flex-end" mt={8}>
              <Button
                colorPalette="red"
                onClick={() => {
                  setCancelError('');
                  setConfirmOpen(true);
                }}
              >
                Cancel Claim
              </Button>
            </Flex>
          )}
        </Dialog.Content>
      </Dialog.Positioner>

      <Dialog.Root
        open={confirmOpen}
        role="alertdialog"
        onOpenChange={(details) => {
          if (!details.open && !cancelling) setConfirmOpen(false);
        }}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="400px" p={6}>
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              Cancel this claim?
            </Text>
            <Text color="gray.600" fontSize="sm">
              This cannot be undone. You will need to submit a new claim if
              you change your mind.
            </Text>

            {cancelError && (
              <Text color="red.500" fontSize="sm" mt={3}>
                {cancelError}
              </Text>
            )}

            <Flex justify="flex-end" gap={3} mt={6}>
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                disabled={cancelling}
              >
                No, go back
              </Button>
              <Button
                colorPalette="red"
                onClick={handleConfirmCancel}
                loading={cancelling}
                loadingText="Cancelling..."
              >
                Yes, cancel claim
              </Button>
            </Flex>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Dialog.Root>
  );
}
