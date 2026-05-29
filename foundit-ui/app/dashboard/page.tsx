'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Spinner } from '@chakra-ui/react';
import { getRoleHome, getSessionRole } from '@/utils/auth';

/** Post-login entry: sends users to their role-specific dashboard. */
export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const role = getSessionRole();

    if (!role) {
      router.replace('/login');
      return;
    }

    router.replace(getRoleHome(role));
  }, [router]);

  return (
    <Box
      minH="50vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Spinner size="lg" color="blue.500" />
    </Box>
  );
}
