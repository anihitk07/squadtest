const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const envModulePath = require.resolve('./env');

function clearEnvModuleCache() {
  delete require.cache[envModulePath];
}

function loadEnvConfig() {
  clearEnvModuleCache();
  return require('./env');
}

const ORIGINAL_ENV = {
  PORT: process.env.PORT,
  DB_FILE: process.env.DB_FILE,
  SEED_FILE: process.env.SEED_FILE,
};

test.afterEach(() => {
  process.env.PORT = ORIGINAL_ENV.PORT;
  process.env.DB_FILE = ORIGINAL_ENV.DB_FILE;
  process.env.SEED_FILE = ORIGINAL_ENV.SEED_FILE;
  clearEnvModuleCache();
});

test('loads defaults relative to repository root when env vars are missing', () => {
  delete process.env.PORT;
  delete process.env.DB_FILE;
  delete process.env.SEED_FILE;

  const { config, rootDir } = loadEnvConfig();

  assert.equal(config.port, 3001);
  assert.equal(config.dbFile, path.resolve(rootDir, 'data/orders.sqlite'));
  assert.equal(config.seedFile, path.resolve(rootDir, 'data/seed/orders.json'));
});

test('respects absolute and relative overrides from process.env', () => {
  process.env.PORT = '4123';
  process.env.DB_FILE = 'custom/storage/orders.sqlite';
  process.env.SEED_FILE = path.resolve('C:\\seed-data\\orders.json');

  const { config, rootDir } = loadEnvConfig();

  assert.equal(config.port, 4123);
  assert.equal(config.dbFile, path.resolve(rootDir, 'custom/storage/orders.sqlite'));
  assert.equal(config.seedFile, path.resolve('C:\\seed-data\\orders.json'));
});
