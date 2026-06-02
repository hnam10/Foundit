'use client';

import { usePathname } from 'next/navigation';
import { RoleShell } from '@/components/layouts/RoleShell';
import { MOCK_STUDENT_DISPLAY_NAME } from '@/constants/mockSession';
import { useLoggedInDisplayName } from '@/hooks/useLoggedInDisplayName';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const userName = useLoggedInDisplayName(MOCK_STUDENT_DISPLAY_NAME);

  return (
    <RoleShell variant="student" userName={userName} activePath={pathname}>
      {children}
    </RoleShell>
  );
}
