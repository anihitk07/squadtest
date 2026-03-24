import { afterEach, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { UserProfileCard } from './UserProfileCard';

afterEach(() => {
  cleanup();
});

test('renders avatar image and formatted values when data is complete', () => {
  render(
    <UserProfileCard
      profile={{
        id: 'user-101',
        fullName: 'Taylor Reed',
        email: 'taylor.reed@example.com',
        avatarUrl: 'https://example.com/avatar.png',
        joinedDate: '2024-11-08',
        bio: 'Productivity enthusiast',
        stats: {
          orderCount: 9,
          lastOrderDate: '2026-03-20',
          lifetimeValueCents: 456789,
        },
      }}
    />,
  );

  expect(screen.getByLabelText('User profile card')).toBeTruthy();
  expect(screen.getByRole('img', { name: 'Taylor Reed avatar' })).toBeTruthy();
  expect(screen.getByText('Joined Nov 8, 2024')).toBeTruthy();
  expect(screen.getByText('Mar 20, 2026')).toBeTruthy();
  expect(screen.getByText('$4,567.89')).toBeTruthy();
});

test('renders fallback initials and null-safe labels', () => {
  render(
    <UserProfileCard
      profile={{
        id: 'user-202',
        fullName: 'Mononym',
        email: 'mono@example.com',
        avatarUrl: null,
        joinedDate: 'invalid-date',
        bio: 'No avatar profile',
        stats: {
          orderCount: 0,
          lastOrderDate: null,
          lifetimeValueCents: 0,
        },
      }}
    />,
  );

  const fallbackAvatar = document.querySelector('.profile-avatar-fallback');
  expect(fallbackAvatar?.textContent).toBe('M');
  expect(screen.getByText('Joined invalid-date')).toBeTruthy();
  expect(screen.getByText('No orders yet')).toBeTruthy();
  expect(screen.getByText('$0.00')).toBeTruthy();
});
