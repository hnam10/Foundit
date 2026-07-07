'use client';

import { Box, type BoxProps } from '@chakra-ui/react';

export function ClaimCard({ children, ...props }: BoxProps) {
  return (
    <Box
      bg="white"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.200"
      p={6}
      {...props}
    >
      {children}
    </Box>
  );
}
