'use client';

import { usePathname } from 'next/navigation';
import { RoleShell } from '@/components/layouts/RoleShell';
import { MOCK_SECURITY_DISPLAY_NAME } from '@/constants/mockSession';
import { useLoggedInDisplayName } from '@/hooks/useLoggedInDisplayName';

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const userName = useLoggedInDisplayName(MOCK_SECURITY_DISPLAY_NAME);

  return (
    <RoleShell variant="security" userName={userName} activePath={pathname}>
      {children}
    </RoleShell>
  );
}
