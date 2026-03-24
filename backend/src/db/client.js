const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { config } = require('../config/env');

let db;

function getDb() {
  if (!db) {
    fs.mkdirSync(path.dirname(config.dbFile), { recursive: true });
    db = new DatabaseSync(config.dbFile);
    db.exec('PRAGMA foreign_keys = ON;');
  }

  return db;
}

module.exports = {
  getDb,
};
