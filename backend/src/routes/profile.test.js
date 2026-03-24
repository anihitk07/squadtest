const assert = require('node:assert/strict');
const Module = require('node:module');
const test = require('node:test');
const express = require('express');

const profileRepositoryPath = require.resolve('../db/profile-repository');
const profileRoutePath = require.resolve('./profile');
const originalProfileRepositoryModule = require.cache[profileRepositoryPath];

function buildProfileRouter(getUserProfile) {
  delete require.cache[profileRoutePath];

  const mockedProfileRepository = new Module(profileRepositoryPath);
  mockedProfileRepository.exports = { getUserProfile };
  mockedProfileRepository.loaded = true;
  require.cache[profileRepositoryPath] = mockedProfileRepository;

  return require('./profile').profileRouter;
}

function restoreProfileModules() {
  delete require.cache[profileRoutePath];

  if (originalProfileRepositoryModule) {
    require.cache[profileRepositoryPath] = originalProfileRepositoryModule;
    return;
  }

  delete require.cache[profileRepositoryPath];
}

async function requestProfileWith(getUserProfile) {
  const app = express();
  app.use('/api', buildProfileRouter(getUserProfile));

  const server = app.listen(0);

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/profile`);
    const body = await response.json();
    return {
      status: response.status,
      body,
    };
  } finally {
    await new Promise((resolve) => {
      server.close(resolve);
    });
  }
}

test.afterEach(() => {
  restoreProfileModules();
});

test('GET /api/profile returns 200 with contract-compliant payload shape', async () => {
  const profile = {
    id: 'user-42',
    fullName: 'Alex Morgan',
    email: 'alex@example.com',
    avatarUrl: 'https://example.com/avatar.png',
    joinedDate: '2024-01-01',
    bio: 'Runner and coffee fan.',
    orderCount: 7,
    lastOrderDate: '2026-03-21',
    lifetimeValueCents: 987654,
  };

  const { status, body } = await requestProfileWith(() => profile);

  assert.equal(status, 200);
  assert.deepEqual(body, {
    data: {
      id: 'user-42',
      fullName: 'Alex Morgan',
      email: 'alex@example.com',
      avatarUrl: 'https://example.com/avatar.png',
      joinedDate: '2024-01-01',
      bio: 'Runner and coffee fan.',
      stats: {
        orderCount: 7,
        lastOrderDate: '2026-03-21',
        lifetimeValueCents: 987654,
      },
    },
  });
});

test('GET /api/profile returns 404 when profile is missing', async () => {
  const { status, body } = await requestProfileWith(() => null);

  assert.equal(status, 404);
  assert.deepEqual(body, { error: 'User profile not found.' });
});

test('GET /api/profile returns 500 when repository throws', async () => {
  const originalConsoleError = console.error;
  console.error = () => {};
  let result;
  try {
    result = await requestProfileWith(() => {
      throw new Error('database offline');
    });
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(result.status, 500);
  assert.deepEqual(result.body, { error: 'Failed to retrieve profile.' });
});
