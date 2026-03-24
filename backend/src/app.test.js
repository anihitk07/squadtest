const assert = require('node:assert/strict');
const Module = require('node:module');
const test = require('node:test');
const express = require('express');

const envModulePath = require.resolve('./config/env');
const initModulePath = require.resolve('./db/init');
const ordersRouteModulePath = require.resolve('./routes/orders');
const profileRouteModulePath = require.resolve('./routes/profile');
const appModulePath = require.resolve('./app');

const originalEnvModule = require.cache[envModulePath];
const originalInitModule = require.cache[initModulePath];
const originalOrdersRouteModule = require.cache[ordersRouteModulePath];
const originalProfileRouteModule = require.cache[profileRouteModulePath];

function createOrderRouter() {
  const router = express.Router();
  router.get('/orders', (req, res) => {
    res.json({ data: [] });
  });
  return router;
}

function createProfileRouter() {
  const router = express.Router();
  router.get('/profile', (req, res) => {
    res.json({ data: { id: 'user-1' } });
  });
  return router;
}

function loadCreateAppWithMocks({ dbFile = 'mock-db.sqlite' } = {}) {
  delete require.cache[appModulePath];

  const callCounts = {
    initialize: 0,
    seed: 0,
  };

  const mockedEnvModule = new Module(envModulePath);
  mockedEnvModule.exports = {
    config: {
      dbFile,
    },
  };
  mockedEnvModule.loaded = true;
  require.cache[envModulePath] = mockedEnvModule;

  const mockedInitModule = new Module(initModulePath);
  mockedInitModule.exports = {
    initializeDatabase() {
      callCounts.initialize += 1;
    },
    seedDatabase() {
      callCounts.seed += 1;
    },
  };
  mockedInitModule.loaded = true;
  require.cache[initModulePath] = mockedInitModule;

  const mockedOrdersModule = new Module(ordersRouteModulePath);
  mockedOrdersModule.exports = {
    ordersRouter: createOrderRouter(),
  };
  mockedOrdersModule.loaded = true;
  require.cache[ordersRouteModulePath] = mockedOrdersModule;

  const mockedProfileModule = new Module(profileRouteModulePath);
  mockedProfileModule.exports = {
    profileRouter: createProfileRouter(),
  };
  mockedProfileModule.loaded = true;
  require.cache[profileRouteModulePath] = mockedProfileModule;

  return {
    createApp: require('./app').createApp,
    callCounts,
  };
}

function restoreModules() {
  delete require.cache[appModulePath];

  if (originalEnvModule) {
    require.cache[envModulePath] = originalEnvModule;
  } else {
    delete require.cache[envModulePath];
  }

  if (originalInitModule) {
    require.cache[initModulePath] = originalInitModule;
  } else {
    delete require.cache[initModulePath];
  }

  if (originalOrdersRouteModule) {
    require.cache[ordersRouteModulePath] = originalOrdersRouteModule;
  } else {
    delete require.cache[ordersRouteModulePath];
  }

  if (originalProfileRouteModule) {
    require.cache[profileRouteModulePath] = originalProfileRouteModule;
  } else {
    delete require.cache[profileRouteModulePath];
  }
}

async function requestApp(createApp, routePath) {
  const app = createApp();
  const server = app.listen(0);

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}${routePath}`);
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
  restoreModules();
});

test('createApp initializes and seeds database before serving routes', async () => {
  const { createApp, callCounts } = loadCreateAppWithMocks({
    dbFile: 'C:\\mock\\test.sqlite',
  });

  const health = await requestApp(createApp, '/api/health');

  assert.equal(callCounts.initialize, 1);
  assert.equal(callCounts.seed, 1);
  assert.equal(health.status, 200);
  assert.deepEqual(health.body, { status: 'ok', dbFile: 'C:\\mock\\test.sqlite' });
});

test('createApp mounts orders and profile routers under /api', async () => {
  const { createApp } = loadCreateAppWithMocks();

  const orders = await requestApp(createApp, '/api/orders');
  const profile = await requestApp(createApp, '/api/profile');

  assert.equal(orders.status, 200);
  assert.deepEqual(orders.body, { data: [] });
  assert.equal(profile.status, 200);
  assert.deepEqual(profile.body, { data: { id: 'user-1' } });
});

test('createApp returns 404 contract for unknown routes', async () => {
  const { createApp } = loadCreateAppWithMocks();
  const response = await requestApp(createApp, '/does-not-exist');

  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { error: 'Not found' });
});
