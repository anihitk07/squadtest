const { config } = require('../src/config/env');
const { initializeDatabase, seedDatabase } = require('../src/db/init');

initializeDatabase();
const result = seedDatabase();
console.log(
  `Database ready at ${config.dbFile}. Seeded: ${result.seeded}. Orders: ${result.orders}. Profile: ${result.profile}.`,
);
