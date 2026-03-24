import { afterEach, expect, test, vi } from 'vitest';
import { fetchUserProfile } from './profileApi';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('fetchUserProfile returns payload data on 200', async () => {
  const profile = {
    id: 'user-1001',
    fullName: 'Taylor Reed',
    email: 'taylor.reed@example.com',
  };

  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: profile }),
    }),
  );

  const data = await fetchUserProfile();

  expect(data).toEqual(profile);
});

test('fetchUserProfile throws status-aware 404 error', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'User profile not found.' }),
    }),
  );

  await expect(fetchUserProfile()).rejects.toMatchObject({
    status: 404,
    message: 'User profile not found.',
  });
});

test('fetchUserProfile throws fallback message when error payload is unavailable', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('invalid json');
      },
    }),
  );

  await expect(fetchUserProfile()).rejects.toMatchObject({
    status: 500,
    message: 'Failed to fetch user profile (500)',
  });
});
