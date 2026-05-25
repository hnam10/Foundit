'use client';

import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Link,
  VStack,
} from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import { useState } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';

export type NavbarVariant = 'student' | 'security';

interface NavbarProps {
  variant?: NavbarVariant;
}

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Found Items', href: '/found-items' },
  { label: 'My Claims', href: '/my-claims' },
];

const variants = {
  student: {
    bg: 'white',
    color: '#1a1a1a',
    border: '#e5e7eb',
    linkHover: '#cc0000',
    mobileHover: 'gray.100',
    loginVariant: 'solid' as const,
  },
  security: {
    bg: '#1a1f2e',
    color: 'white',
    border: '#374151',
    linkHover: '#f87171',
    mobileHover: 'rgba(255,255,255,0.08)',
    loginVariant: 'outline' as const,
  },
};

export function Navbar({ variant = 'student' }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const s = variants[variant];

  return (
    <Box
      as="nav"
      bg={s.bg}
      color={s.color}
      px={{ base: 4, md: 8 }}
      py={3}
      borderBottomWidth="1px"
      borderBottomColor={s.border}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Flex align="center" justify="space-between" h={10}>
        <Link asChild>
          <NextLink href="/">
            <Image
              src="/logo.png"
              alt="FoundIt"
              width={100}
              height={100}
              style={{ width: '100%', height: 'auto' }}
            />
          </NextLink>
        </Link>

        {/* Desktop */}
        <HStack gap={6} display={{ base: 'none', md: 'flex' }} align="center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              asChild
              fontWeight="medium"
              fontSize="sm"
              color={s.color}
              _hover={{ color: s.linkHover, textDecoration: 'none' }}
            >
              <NextLink href={link.href}>{link.label}</NextLink>
            </Link>
          ))}
          <Button colorPalette="red" variant={s.loginVariant} size="sm" px={5}>
            Login
          </Button>
        </HStack>

        {/* Mobile hamburger */}
        <IconButton
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          variant="ghost"
          size="xl"
          color={s.color}
          display={{ base: 'flex', md: 'none' }}
          onClick={() => setMenuOpen((prev) => !prev)}
          _icon={{ width: '8', height: '8' }}
        >
          {menuOpen ? <HiX /> : <HiMenu />}
        </IconButton>
      </Flex>

      {/* Mobile dropdown */}
      {menuOpen && (
        <VStack
          display={{ base: 'flex', md: 'none' }}
          align="stretch"
          gap={1}
          mt={3}
          pt={3}
          pb={2}
          borderTopWidth="1px"
          borderTopColor={s.border}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              asChild
              display="block"
              px={3}
              py={2}
              fontSize="sm"
              fontWeight="medium"
              color={s.color}
              borderRadius="md"
              _hover={{ bg: s.mobileHover, textDecoration: 'none' }}
              onClick={() => setMenuOpen(false)}
            >
              <NextLink href={link.href}>{link.label}</NextLink>
            </Link>
          ))}
          <Button
            colorPalette="red"
            variant={s.loginVariant}
            size="sm"
            mt={1}
            w="full"
          >
            Login
          </Button>
        </VStack>
      )}
    </Box>
  );
}
