'use client';

import { useState } from 'react';
import { Dialog, Flex, Portal, Stack, Text, Textarea } from '@chakra-ui/react';
import { Button } from '@/components/ui/Button';
import { updateClaimStatus } from '@/lib/api/claims';
import type { SecurityClaimDetail } from '@/types/claims';

interface CloseClaimDialogProps {
  claim: SecurityClaimDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClosed: (claim: SecurityClaimDetail) => void;
}

function getCloseClaimDescription(claim: SecurityClaimDetail): string {
  if (claim.status === 'approved') {
    return 'Close this claim if the student will not pick up the matched item or the match was incorrect. The student will be notified with your reason.';
  }

  return 'Close this claim if no matching item was found or the claim cannot be fulfilled. The student will be notified with your reason.';
}

export function CloseClaimDialog({
  claim,
  open,
  onOpenChange,
  onClosed,
}: CloseClaimDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [closing, setClosing] = useState(false);

  const trimmedReason = reason.trim();
  const canSubmit = trimmedReason.length > 0 && !closing;

  function handleOpenChange(nextOpen: boolean) {
    if (closing) return;
    if (!nextOpen) {
      setReason('');
      setError('');
    }
    onOpenChange(nextOpen);
  }

  async function handleConfirmClose() {
    if (!canSubmit) return;

    setClosing(true);
    setError('');

    try {
      const updated = await updateClaimStatus(claim.claimId, {
        status: 'rejected',
        rejectionReason: trimmedReason,
      });
      setReason('');
      onOpenChange(false);
      onClosed(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close claim.');
    } finally {
      setClosing(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      role="alertdialog"
      onOpenChange={(details) => handleOpenChange(details.open)}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="md" p={6}>
            <Dialog.Header p={0} mb={4}>
              <Dialog.Title fontSize="lg">Close this claim?</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body p={0}>
              <Stack gap={4}>
                <Text fontSize="sm" color="gray.600">
                  {getCloseClaimDescription(claim)}
                </Text>
                <Stack gap={1}>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    Reason for closing
                  </Text>
                  <Textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="e.g. No matching found item in storage"
                    rows={4}
                    fontSize="sm"
                    disabled={closing}
                  />
                </Stack>
                {error ? (
                  <Text fontSize="sm" color="red.500">
                    {error}
                  </Text>
                ) : null}
              </Stack>
            </Dialog.Body>
            <Dialog.Footer p={0} mt={6}>
              <Flex justify="flex-end" gap={3} w="full">
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={closing}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  disabled={!canSubmit}
                  loading={closing}
                  loadingText="Closing..."
                  onClick={() => void handleConfirmClose()}
                >
                  Close Claim
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
