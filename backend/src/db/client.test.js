const assert = require('node:assert/strict');
const Module = require('node:module');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const envModulePath = require.resolve('../config/env');
const clientModulePath = require.resolve('./client');

const originalEnvModule = require.cache[envModulePath];

function loadClientWithMocks({ dbFile }) {
  delete require.cache[clientModulePath];

  const mockedEnvModule = new Module(envModulePath);
  mockedEnvModule.exports = {
    config: { dbFile },
  };
  mockedEnvModule.loaded = true;
  require.cache[envModulePath] = mockedEnvModule;
  return require('./client');
}

function restoreAllModules() {
  delete require.cache[clientModulePath];

  if (originalEnvModule) {
    require.cache[envModulePath] = originalEnvModule;
  } else {
    delete require.cache[envModulePath];
  }
}

test.afterEach(() => {
  restoreAllModules();
});

test('getDb initializes sqlite file once and enables foreign keys', () => {
  const dbFile = path.resolve(__dirname, '..', '..', '..', 'data', 'client-test.sqlite');
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });

  if (fs.existsSync(dbFile)) {
    fs.unlinkSync(dbFile);
  }

  const client = loadClientWithMocks({ dbFile });
  const first = client.getDb();
  const second = client.getDb();

  assert.ok(first);
  assert.equal(first, second);
  assert.equal(fs.existsSync(dbFile), true);

  const pragmaRow = first.prepare('PRAGMA foreign_keys;').get();
  assert.equal(pragmaRow.foreign_keys, 1);

  first.close();
  fs.unlinkSync(dbFile);
});
