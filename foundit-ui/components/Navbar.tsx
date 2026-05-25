'use client';

import { Box, Flex, HStack, Link, Text } from '@chakra-ui/react';
// import { CircleUserRound } from 'lucide-react';

interface NavbarProps {
  variant?: 'student' | 'guest';
}

export default function Navbar({ variant = 'guest' }: NavbarProps) {
  return (
    <Box
      as="nav"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      px={8}
      py={3}
      w="100%"
    >
      <Flex maxW="1200px" mx="auto" align="center">
        {/* Left Side */}
        <HStack gap={2} mr="auto" align="baseline">
          <Text fontSize="2xl" fontWeight="bold" color="red.600" lineHeight="1">
            Seneca
          </Text>

          <Text fontSize="md" fontWeight="bold" color="gray.400" lineHeight="1">
            FoundIt
          </Text>
        </HStack>

        {/* Menu */}
        <HStack gap={12} mr={16}>
          <Link href="#" color="gray.700" fontWeight="medium">
            Home
          </Link>

          <Link href="#" color="gray.700" fontWeight="medium">
            Found Items
          </Link>

          <Link href="#" color="gray.700" fontWeight="medium">
            My claim
          </Link>
        </HStack>

        {/* Right Side */}
        {variant === 'student' && (
          <HStack gap={3}>
            {/* To do: backend auth and user data fetching */}
            <Text fontSize="sm" fontWeight="medium" color="gray.900">
              User Name
            </Text>

            {/* <CircleUserRound size={22} /> */}
          </HStack>
        )}
      </Flex>
    </Box>
  );
}
