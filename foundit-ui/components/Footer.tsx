'use client';
import { Box, Flex, HStack, Link, Text } from '@chakra-ui/react';

export default function Footer() {
  return (
    <Box bg="black" color="gray.400" py={3} px={8}>
      <Flex maxW="1200px" mx="auto" align="center">
        {/* Left Side */}
        <Text fontSize="sm">© 2026 Foundit. All rights reserved.</Text>

        {/* Right Side */}
        <HStack ml="auto" gap={8}>
          <Link href="#" fontSize="sm" color="gray.400">
            Privacy Policy
          </Link>

          <Link href="#" fontSize="sm" color="gray.400">
            Terms of Service
          </Link>

          <Link href="#" fontSize="sm" color="gray.400">
            Contact
          </Link>
        </HStack>
      </Flex>
    </Box>
  );
}
