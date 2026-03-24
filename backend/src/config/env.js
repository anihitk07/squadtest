const path = require('node:path');

const rootDir = path.resolve(__dirname, '..', '..');

function resolveFromRoot(value) {
  if (path.isAbsolute(value)) {
    return value;
  }

  return path.resolve(rootDir, value);
}

const config = {
  port: Number(process.env.PORT ?? 3001),
  dbFile: resolveFromRoot(process.env.DB_FILE ?? 'data/orders.sqlite'),
  seedFile: resolveFromRoot(process.env.SEED_FILE ?? 'data/seed/orders.json'),
};

module.exports = {
  config,
  rootDir,
};
