'use client';

/**
 * Navbar — sticky top navigation bar.
 *
 * Variants:
 *   'guest'    — not logged in; no username, shows Login button.
 *   'student'  — authenticated student; shows Home, Found Items, My Claims + user dropdown.
 *   'security' — authenticated security staff; shows Home, Items, Claims, QR/Link + user dropdown.
 *
 * Data shape:
 *   The parent calls GET /api/users/me (returns NavUser), then passes
 *   userName={`${user.firstName} ${user.lastName}`} down to this component.
 *   (@see NavUser type exported below)
 *
 * Active-link detection: uses Next.js `usePathname`.
 *   (@see https://nextjs.org/docs/app/api-reference/functions/use-pathname)
 *
 * User dropdown: Chakra UI v3 Menu.
 *   (@see https://www.chakra-ui.com/docs/components/menu)
 *
 * Usage:
 *   // Guest (standalone page)
 *   <Navbar variant="guest" />
 *
 *   // Authenticated — activePath threaded from the layout
 *   const pathname = usePathname();
 *   <Navbar variant="student" userName="Jane Smith" activePath={pathname} />
 *   <Navbar variant="security" userName="Officer Reyes" activePath={pathname} />
 *
 *   // Via RoleShell (recommended for role-based layouts)
 *   <RoleShell variant="student" userName={displayName} activePath={pathname}>
 *     {children}
 *   </RoleShell>
 */

import {
  Box,
  Button as ChakraButton,
  Flex,
  HStack,
  IconButton,
  Link,
  Menu,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Button } from './ui/Button';
import MdiIcon from '@mdi/react';
import { mdiAccountCircle, mdiChevronDown, mdiClose, mdiMenu } from '@mdi/js';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { signOut } from '@/utils/auth';

/**
 * Partial view of the user object returned by GET /api/users/me.
 * The parent resolves this and builds the username string for this component.
 * (@see backend/src/routes/users.ts — GET /me)
 */
export interface NavUser {
  firstName: string;
  lastName: string;
  role: 'student' | 'security' | 'admin';
}

export type NavbarVariant = 'guest' | 'student' | 'security';

interface NavbarProps {
  variant?: NavbarVariant;
  /** Formatted display name — build as `${NavUser.firstName} ${NavUser.lastName}`. */
  userName?: string;
  /** Current pathname — pass from the layout via usePathname(). Falls back to internal usePathname() if omitted. */
  activePath?: string;
}

// ── Dropdown ──────────────────────────────────────────────────────────────────

type DropdownVariant = 'user';

export interface DropdownItem {
  label: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}

type DropdownProps =
  | { variant: 'user'; items: DropdownItem[]; userName: string }
  | {
      variant: Exclude<DropdownVariant, 'user'>;
      items: DropdownItem[];
      userName?: never;
    };

export function Dropdown({ variant, items, userName }: DropdownProps) {
  const router = useRouter();

  const trigger = (() => {
    switch (variant) {
      case 'user':
        return (
          <ChakraButton variant="ghost" size="sm" px={2} ml={2}>
            <HStack gap={2}>
              <Text fontSize="md" fontWeight="medium" color="gray.900">
                {userName}
              </Text>
              <MdiIcon path={mdiAccountCircle} size={0.9} />
              <MdiIcon path={mdiChevronDown} size={0.7} />
            </HStack>
          </ChakraButton>
        );
      default:
        variant satisfies never;
        return null;
    }
  })();

  return (
    <Menu.Root>
      <Menu.Trigger asChild>{trigger}</Menu.Trigger>
      <Menu.Positioner mt={4}>
        <Menu.Content minW="160px">
          {items.map(({ label, href, onClick, danger }) => (
            <Menu.Item
              key={label}
              value={label.toLowerCase()}
              fontSize="sm"
              fontWeight="medium"
              color={danger ? 'red.500' : 'gray.700'}
              px={4}
              py={2}
              _highlighted={{ bg: 'gray.100' }}
              onClick={() => {
                if (onClick) {
                  onClick();
                } else if (href) {
                  router.push(href);
                }
              }}
            >
              {label}
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

/** Nav links per variant. */
const navLinksByVariant: Record<
  NavbarVariant,
  { label: string; href: string }[]
> = {
  guest: [{ label: 'Home', href: '/' }],
  student: [
    { label: 'Home', href: '/student/dashboard' },
    { label: 'Found Items', href: '/found-items' },
    { label: 'My Claims', href: '/my-claims' },
  ],
  security: [
    { label: 'Home', href: '/security/dashboard' },
    { label: 'Items', href: '/security/items' },
    { label: 'Claims', href: '/security/claims' },
    { label: 'QR / Link', href: '/security/qr' },
  ],
};

/** Dropdown items shown under the user menu (student and security variants). */
const userMenuItems: DropdownItem[] = [
  { label: 'Settings', href: '/settings' },
  { label: 'Notifications', href: '/notifications' },
  { label: 'Sign Out', onClick: signOut, danger: true },
];

// ── Navbar ────────────────────────────────────────────────────────────────────

export default function Navbar({
  variant = 'guest',
  userName = 'User Name',
  activePath,
}: NavbarProps) {
  const pathname = usePathname();
  const currentPath = activePath ?? pathname;
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = navLinksByVariant[variant];
  const isAuthenticated = variant !== 'guest';

  return (
    <Box
      as="nav"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      px={{ base: 4, md: 8 }}
      minH="75px"
      w="100%"
      position="sticky"
      top={0}
      zIndex={10}
    >
      {/* ── Main row (always visible) ─────────────────────────────────────── */}
      <Flex h="75px" align="center">
        {/* Brand — mr="auto" pushes all right-side items to the far right */}
        <HStack gap={2} mr="auto" align="baseline">
          <Text fontSize="2xl" fontWeight="bold" color="red.600" lineHeight="1">
            Seneca
          </Text>
          <Text fontSize="md" fontWeight="bold" color="gray.400" lineHeight="1">
            FoundIt
          </Text>
        </HStack>

        {/* Desktop: nav links + user menu (hidden on mobile) */}
        <HStack gap={10} display={{ base: 'none', md: 'flex' }} align="center">
          {navLinks.map(({ label, href }) => {
            const isActive = currentPath === href;
            return (
              <Link
                key={href}
                asChild
                fontSize="md"
                fontWeight="medium"
                color={isActive ? 'red.600' : 'gray.700'}
                borderBottom={isActive ? '2px solid' : 'none'}
                borderColor="red.600"
                pb={isActive ? '2px' : undefined}
                _hover={{ color: 'red.600', textDecoration: 'none' }}
              >
                <NextLink href={href}>{label}</NextLink>
              </Link>
            );
          })}

          {!isAuthenticated && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push('/login')}
            >
              Login
            </Button>
          )}

          {isAuthenticated && (
            <Dropdown
              variant="user"
              userName={userName}
              items={userMenuItems}
            />
          )}
        </HStack>

        {/* Mobile: hamburger toggle (hidden on desktop) */}
        <IconButton
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          variant="ghost"
          display={{ base: 'flex', md: 'none' }}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? (
            <MdiIcon path={mdiClose} size={0.9} />
          ) : (
            <MdiIcon path={mdiMenu} size={0.9} />
          )}
        </IconButton>
      </Flex>

      {/* ── Mobile dropdown (expands below main row) ──────────────────────── */}
      {mobileOpen && (
        <VStack
          display={{ base: 'flex', md: 'none' }}
          align="stretch"
          gap={1}
          pb={3}
          borderTop="1px solid"
          borderColor="gray.200"
        >
          {navLinks.map(({ label, href }) => {
            const isActive = currentPath === href;
            return (
              <Link
                key={href}
                asChild
                display="block"
                px={4}
                py={2}
                fontSize="sm"
                fontWeight="medium"
                color={isActive ? 'red.600' : 'gray.700'}
                borderRadius="md"
                _hover={{ bg: 'gray.100', textDecoration: 'none' }}
                onClick={() => setMobileOpen(false)}
              >
                <NextLink href={href}>{label}</NextLink>
              </Link>
            );
          })}

          {!isAuthenticated && (
            <Box px={4} pt={2}>
              <Button
                variant="primary"
                size="sm"
                w="full"
                onClick={() => {
                  setMobileOpen(false);
                  router.push('/login');
                }}
              >
                Login
              </Button>
            </Box>
          )}

          {isAuthenticated && (
            <>
              <Box h="1px" bg="gray.200" my={1} mx={4} />
              {userMenuItems.map(({ label, href, onClick, danger }) =>
                onClick ? (
                  <ChakraButton
                    key={label}
                    variant="ghost"
                    justifyContent="flex-start"
                    w="full"
                    px={4}
                    py={2}
                    h="auto"
                    fontSize="sm"
                    fontWeight="medium"
                    color={danger ? 'red.500' : 'gray.700'}
                    borderRadius="md"
                    _hover={{ bg: 'gray.100' }}
                    onClick={() => {
                      setMobileOpen(false);
                      onClick();
                    }}
                  >
                    {label}
                  </ChakraButton>
                ) : (
                  <Link
                    key={href}
                    asChild
                    display="block"
                    px={4}
                    py={2}
                    fontSize="sm"
                    fontWeight="medium"
                    color={danger ? 'red.500' : 'gray.700'}
                    borderRadius="md"
                    _hover={{ bg: 'gray.100', textDecoration: 'none' }}
                    onClick={() => setMobileOpen(false)}
                  >
                    <NextLink href={href!}>{label}</NextLink>
                  </Link>
                )
              )}
            </>
          )}
        </VStack>
      )}
    </Box>
  );
}
