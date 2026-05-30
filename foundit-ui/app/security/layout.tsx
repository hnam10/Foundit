'use client';

import { usePathname } from 'next/navigation';
import { RoleShell } from '@/components/layouts/RoleShell';
import { MOCK_SECURITY_DISPLAY_NAME } from '@/constants/mockSession';

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <RoleShell
      variant="security"
      userName={MOCK_SECURITY_DISPLAY_NAME}
      activePath={pathname}
    >
      {children}
    </RoleShell>
  );
}
