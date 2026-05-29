import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROLE_HOME, type UserRole } from './utils/routes';

const ROLE_COOKIE = 'foundit_role';

function parseRole(value: string | undefined): UserRole | null {
  if (value === 'student' || value === 'security' || value === 'admin') {
    return value;
  }
  return null;
}

function redirectToRoleHome(request: NextRequest, role: UserRole) {
  return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = parseRole(request.cookies.get(ROLE_COOKIE)?.value);

  if (pathname.startsWith('/student')) {
    if (!role) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role !== 'student' && role !== 'admin') {
      return redirectToRoleHome(request, role);
    }
  }

  if (pathname.startsWith('/security')) {
    if (!role) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role !== 'security' && role !== 'admin') {
      return redirectToRoleHome(request, role);
    }
  }

  if (pathname.startsWith('/admin')) {
    if (!role) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role !== 'admin') {
      return redirectToRoleHome(request, role);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/student/:path*', '/security/:path*', '/admin/:path*'],
};
