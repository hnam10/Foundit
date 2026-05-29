'use client';

import { Box, Flex, HStack, Link, Text } from '@chakra-ui/react';
import { IoPersonCircleOutline } from 'react-icons/io5';

type NavbarVariant = 'student' | 'guest' | 'security';

interface NavLink {
  label: string;
  href: string;
}

interface NavbarProps {
  variant?: NavbarVariant;
  userName?: string;
  activePath?: string;
}

const studentLinks: NavLink[] = [
  { label: 'Home', href: '/student/dashboard' },
  { label: 'Found Items', href: '#' },
  { label: 'My claims', href: '#' },
];

const securityLinks: NavLink[] = [
  { label: 'Home', href: '/security/dashboard' },
  { label: 'Items', href: '#' },
  { label: 'Claims', href: '#' },
  { label: 'QR/Link', href: '#' },
];

function NavMenu({
  links,
  activePath,
}: {
  links: NavLink[];
  activePath?: string;
}) {
  return (
    <HStack gap={10}>
      {links.map((item) => {
        const isActive = activePath === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            fontSize="md"
            fontWeight="medium"
            color={isActive ? 'red.600' : 'gray.700'}
            _hover={{ color: isActive ? 'red.600' : 'gray.900' }}
          >
            {item.label}
          </Link>
        );
      })}
    </HStack>
  );
}

export default function Navbar({
  variant = 'guest',
  userName,
  activePath,
}: NavbarProps) {
  const showUser = variant === 'student' || variant === 'security';
  const navLinks = variant === 'security' ? securityLinks : studentLinks;

  return (
    <Box
      as="nav"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      px={8}
      h="75px"
      w="100%"
    >
      <Flex maxW="1200px" mx="auto" h="100%" align="center">
        <HStack gap={2} mr="auto" align="baseline">
          <Text fontSize="2xl" fontWeight="bold" color="red.600" lineHeight="1">
            Seneca
          </Text>
          <Text fontSize="md" fontWeight="bold" color="gray.400" lineHeight="1">
            FoundIt
          </Text>
        </HStack>

        <HStack gap={10} ml="auto">
          <NavMenu links={navLinks} activePath={activePath} />
        </HStack>

        {showUser && (
          <HStack gap={2} ml={12} flexShrink={0}>
            <Text fontSize="sm" fontWeight="medium" color="gray.900">
              {userName ?? 'User Name'}
            </Text>
            <Box color="gray.500" aria-hidden>
              <IoPersonCircleOutline size={28} />
            </Box>
          </HStack>
        )}
      </Flex>
    </Box>
  );
}
