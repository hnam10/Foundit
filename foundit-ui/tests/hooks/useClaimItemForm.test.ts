import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiFetch } from '@/lib/api/client';
import { useClaimItemForm } from '@/hooks/useClaimItemForm';

const pushMock = vi.fn();
const backMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, back: backMock }),
}));

vi.mock('@/lib/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/client')>();
  return { ...actual, apiFetch: vi.fn() };
});

const apiFetchMock = vi.mocked(apiFetch);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useClaimItemForm', () => {
  it('flags missing required fields and skips the request', async () => {
    const { result } = renderHook(() => useClaimItemForm());

    await act(() => result.current.handleSubmit());

    expect(result.current.errors.category).toBe('Category is a required field');
    expect(result.current.errors.itemName).toBe(
      'Item Name is a required field'
    );
    expect(result.current.errors.description).toBe(
      'Description is a required field'
    );
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it('rejects an item name longer than the backend Item.title cap (100)', async () => {
    const { result } = renderHook(() => useClaimItemForm());

    act(() => {
      result.current.setCategory('Electronics');
      result.current.setItemName('x'.repeat(101));
      result.current.setDescription('Black backpack');
    });
    await act(() => result.current.handleSubmit());

    expect(result.current.errors.itemName).toBe(
      'Item Name must be 100 characters or fewer'
    );
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it('defaults notification preference to email (opted in)', () => {
    const { result } = renderHook(() => useClaimItemForm());

    expect(result.current.notificationPreference).toBe('email');
  });

  it('submits trimmed values and navigates to the student dashboard', async () => {
    apiFetchMock.mockResolvedValueOnce({ claimId: 'claim-1' });
    const { result } = renderHook(() => useClaimItemForm());

    act(() => {
      result.current.setCategory('  Electronics  ');
      result.current.setItemName('MacBook Pro');
      result.current.setDescription('  Black backpack  ');
    });
    await act(() => result.current.handleSubmit());

    // itemName/notificationPreference are stub fields — createClaimSchema has
    // no columns for them yet, so the payload must not include them.
    expect(apiFetchMock).toHaveBeenCalledWith('/api/claims', {
      method: 'POST',
      body: JSON.stringify({
        category: 'Electronics',
        description: 'Black backpack',
      }),
    });
    expect(pushMock).toHaveBeenCalledWith('/student/dashboard');
    // Stays true through the route transition to block duplicate submits.
    expect(result.current.isSubmitting).toBe(true);
  });

  it('maps backend statuses to user-facing copy', async () => {
    apiFetchMock.mockRejectedValueOnce(new ApiError(409, 'conflict'));
    const { result } = renderHook(() => useClaimItemForm());

    act(() => {
      result.current.setCategory('Electronics');
      result.current.setItemName('MacBook Pro');
      result.current.setDescription('Black backpack');
    });
    await act(() => result.current.handleSubmit());

    expect(result.current.submitError).toBe(
      'A campus must be assigned to your account before you can submit a claim.'
    );
    expect(result.current.isSubmitting).toBe(false);
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('surfaces configuration/network failures with their own message', async () => {
    apiFetchMock.mockRejectedValueOnce(
      new ApiError(0, 'Unable to connect to server.')
    );
    const { result } = renderHook(() => useClaimItemForm());

    act(() => {
      result.current.setCategory('Electronics');
      result.current.setItemName('MacBook Pro');
      result.current.setDescription('Black backpack');
    });
    await act(() => result.current.handleSubmit());

    expect(result.current.submitError).toBe('Unable to connect to server.');
    expect(result.current.isSubmitting).toBe(false);
  });
});
