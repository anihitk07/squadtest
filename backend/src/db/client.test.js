const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');

const envModulePath = require.resolve('../config/env');
const clientModulePath = require.resolve('./client');
const originalEnvModule = require.cache[envModulePath];
const originalFsMkdirSync = require('node:fs').mkdirSync;
const sqlite = require('node:sqlite');
const originalDatabaseSync = sqlite.DatabaseSync;

function loadClientWithOverrides({ dbFile }) {
  delete require.cache[clientModulePath];

  const fsCalls = [];
  const sqliteInstances = [];
  const execCalls = [];

  const mockedEnvModule = new Module(envModulePath);
  mockedEnvModule.exports = {
    config: { dbFile },
  };
  mockedEnvModule.loaded = true;
  require.cache[envModulePath] = mockedEnvModule;

  require('node:fs').mkdirSync = (dir, options) => {
    fsCalls.push({ dir, options });
  };

  sqlite.DatabaseSync = class FakeDatabaseSync {
    constructor(file) {
      sqliteInstances.push(file);
    }

    exec(sql) {
      execCalls.push(sql);
    }
  };

  return {
    client: require('./client'),
    fsCalls,
    sqliteInstances,
    execCalls,
  };
}

function restoreAllModules() {
  delete require.cache[clientModulePath];

  if (originalEnvModule) {
    require.cache[envModulePath] = originalEnvModule;
  } else {
    delete require.cache[envModulePath];
  }

  require('node:fs').mkdirSync = originalFsMkdirSync;
  sqlite.DatabaseSync = originalDatabaseSync;
}

test.afterEach(() => {
  restoreAllModules();
});

test('getDb initializes sqlite file once and enables foreign keys', () => {
  const dbFile = path.resolve('C:\\data\\orders.sqlite');
  const { client, fsCalls, sqliteInstances, execCalls } = loadClientWithOverrides({ dbFile });

  const first = client.getDb();
  const second = client.getDb();

  assert.ok(first);
  assert.equal(first, second);
  assert.deepEqual(fsCalls, [
    {
      dir: path.dirname(dbFile),
      options: { recursive: true },
    },
  ]);
  assert.deepEqual(sqliteInstances, [dbFile]);
  assert.deepEqual(execCalls, ['PRAGMA foreign_keys = ON;']);
});
