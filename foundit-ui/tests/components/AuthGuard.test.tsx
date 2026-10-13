import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { AuthGuard } from '@/components/AuthGuard';
import { clearAuthSession, setSessionRole, setTokens } from '@/utils/auth';

const navigation = vi.hoisted(() => ({
  pathname: '/student/dashboard',
  replace: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ replace: navigation.replace }),
}));

beforeEach(() => {
  clearAuthSession();
  navigation.pathname = '/student/dashboard';
  navigation.replace.mockClear();
});
afterEach(cleanup);

function login(role: 'student' | 'security' | 'admin' = 'student') {
  localStorage.setItem('user', JSON.stringify({ role }));
  setTokens('token', 'refresh');
  setSessionRole(role);
}

test('hides protected content and redirects without a session', () => {
  render(
    <AuthGuard>
      <div>Private content</div>
    </AuthGuard>
  );
  expect(screen.queryByText('Private content')).toBeNull();
  expect(navigation.replace).toHaveBeenCalledWith('/login');
});

test('removes protected content immediately when signed out', () => {
  login();
  render(
    <AuthGuard>
      <div>Private content</div>
    </AuthGuard>
  );
  expect(screen.getByText('Private content')).toBeTruthy();
  act(() => clearAuthSession());
  expect(screen.queryByText('Private content')).toBeNull();
  expect(navigation.replace).toHaveBeenCalledWith('/login');
});

test.each(['pageshow', 'storage', 'focus'])(
  'rechecks restored storage on %s',
  (event) => {
    login();
    render(
      <AuthGuard>
        <div>Private content</div>
      </AuthGuard>
    );
    act(() => {
      localStorage.clear();
      window.dispatchEvent(new Event(event));
    });
    expect(screen.queryByText('Private content')).toBeNull();
    expect(navigation.replace).toHaveBeenCalledWith('/login');
  }
);

test('redirects the wrong role to its home', () => {
  login('security');
  render(
    <AuthGuard>
      <div>Private content</div>
    </AuthGuard>
  );
  expect(screen.queryByText('Private content')).toBeNull();
  expect(navigation.replace).toHaveBeenCalledWith('/security/dashboard');
});

test('allows admin access to student pages', () => {
  login('admin');
  render(
    <AuthGuard>
      <div>Private content</div>
    </AuthGuard>
  );
  expect(screen.getByText('Private content')).toBeTruthy();
  expect(navigation.replace).not.toHaveBeenCalled();
});

test.each(['/login', '/security/add-photos/public-token'])(
  'keeps public route %s accessible',
  (pathname) => {
    navigation.pathname = pathname;
    render(
      <AuthGuard>
        <div>Public content</div>
      </AuthGuard>
    );
    expect(screen.getByText('Public content')).toBeTruthy();
    expect(navigation.replace).not.toHaveBeenCalled();
  }
);
