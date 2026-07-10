'use client';

import { Button } from '@/components/ui/Button';

interface CloseClaimButtonProps {
  onClick: () => void;
}

export function CloseClaimButton({ onClick }: CloseClaimButtonProps) {
  return (
    <Button
      variant="dangerOutline"
      borderColor="red.200"
      _hover={{ bg: 'red.50', borderColor: 'red.300' }}
      onClick={onClick}
    >
      Close Claim
    </Button>
  );
}
