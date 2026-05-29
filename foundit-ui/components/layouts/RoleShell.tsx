'use client';

import { Box } from '@chakra-ui/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface RoleShellProps {
  variant: 'student' | 'security';
  userName?: string;
  activePath?: string;
  children: React.ReactNode;
}

export function RoleShell({
  variant,
  userName,
  activePath,
  children,
}: RoleShellProps) {
  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      <Navbar variant={variant} userName={userName} activePath={activePath} />
      <Box
        as="main"
        flex={1}
        maxW="1200px"
        mx="auto"
        w="full"
        px={{ base: 4, md: 8 }}
        py={{ base: 8, md: 10 }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
