import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { UserProfilePage } from './UserProfilePage';

afterEach(() => {
  cleanup();
});

function deferredPromise() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

test('shows loading state before fetch resolves', async () => {
  const pending = deferredPromise();
  const fetchProfile = vi.fn(() => pending.promise);

  render(<UserProfilePage fetchProfile={fetchProfile} />);

  expect(screen.getByText('Loading user profile...')).toBeTruthy();

  pending.resolve({
    id: 'user-1',
    fullName: 'A B',
    email: 'ab@example.com',
    avatarUrl: null,
    joinedDate: '2024-01-01',
    bio: 'Bio',
    stats: { orderCount: 0, lastOrderDate: null, lifetimeValueCents: 0 },
  });

  await waitFor(() => {
    expect(screen.queryByText('Loading user profile...')).toBeNull();
  });
});

test('renders success state including null fallbacks and stat formatting', async () => {
  const fetchProfile = vi.fn().mockResolvedValue({
    id: 'user-1001',
    fullName: 'Taylor Reed',
    email: 'taylor.reed@example.com',
    avatarUrl: null,
    joinedDate: '2024-11-08',
    bio: 'Productivity enthusiast',
    stats: {
      orderCount: 0,
      lastOrderDate: null,
      lifetimeValueCents: 123456789,
    },
  });

  render(<UserProfilePage fetchProfile={fetchProfile} />);

  expect(await screen.findByText('Taylor Reed')).toBeTruthy();
  expect(screen.getByText('taylor.reed@example.com')).toBeTruthy();
  expect(screen.getByText('Productivity enthusiast')).toBeTruthy();
  expect(screen.getByText('No orders yet')).toBeTruthy();
  expect(screen.getByText('$1,234,567.89')).toBeTruthy();

  const ordersStat = screen.getAllByText('0').at(0);
  expect(ordersStat).toBeTruthy();

  const avatarFallback = document.querySelector('.profile-avatar-fallback');
  expect(avatarFallback?.textContent).toBe('TR');
});

test('renders not-found state for 404 responses', async () => {
  const notFoundError = new Error('User profile not found.');
  notFoundError.status = 404;
  const fetchProfile = vi.fn().mockRejectedValue(notFoundError);

  render(<UserProfilePage fetchProfile={fetchProfile} />);

  expect(await screen.findByText('User profile not found.')).toBeTruthy();
  expect(screen.queryByLabelText('User profile card')).toBeNull();
});

test('renders generic error state for non-404 failures', async () => {
  const fetchProfile = vi.fn().mockRejectedValue(new Error('Failed to retrieve profile.'));

  render(<UserProfilePage fetchProfile={fetchProfile} />);

  expect(await screen.findByText('Failed to retrieve profile.')).toBeTruthy();
  expect(screen.queryByLabelText('User profile card')).toBeNull();
});
