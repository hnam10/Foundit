'use client';

import { usePathname } from 'next/navigation';
import { RoleShell } from '@/components/layouts/RoleShell';
import { MOCK_STUDENT_DISPLAY_NAME } from '@/constants/mockSession';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <RoleShell
      variant="student"
      userName={MOCK_STUDENT_DISPLAY_NAME}
      activePath={pathname}
    >
      {children}
    </RoleShell>
  );
}
