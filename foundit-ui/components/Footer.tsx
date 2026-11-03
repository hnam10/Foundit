'use client';
import { Box, Flex, Text } from '@chakra-ui/react';

export default function Footer() {
  return (
    // position+zIndex keep the footer above full-viewport fixed backdrops
    // (e.g. the claim-item hero overlay) without changing its layout.
    <Box
      as="footer"
      bg="black"
      color="gray.400"
      px={8}
      h={20}
      w="full"
      position="relative"
      zIndex={1}
    >
      <Flex maxW="6xl" mx="auto" h="full" align="center">
        <Text fontSize="sm">© 2026 FoundIt. All rights reserved.</Text>
      </Flex>
    </Box>
  );
}
