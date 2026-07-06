import { describe, expect, test, vi } from 'vitest';
import requireRole from '../src/middleware/requireRole';

function mockRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
}

describe('requireRole middleware', () => {
  test('returns 401 if user is not logged in', () => {
    const req = {};
    const res = mockRes();
    const next = vi.fn();

    requireRole('student' as never)(req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 403 if user has wrong role', () => {
    const req = {
      user: { role: 'student' },
    };
    const res = mockRes();
    const next = vi.fn();

    requireRole('admin' as never)(req as never, res as never, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next if user has correct role', () => {
    const req = {
      user: { role: 'admin' },
    };
    const res = mockRes();
    const next = vi.fn();

    requireRole('admin' as never)(req as never, res as never, next);

    expect(next).toHaveBeenCalled();
  });
});