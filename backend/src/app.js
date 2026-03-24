const cors = require('cors');
const express = require('express');
const { config } = require('./config/env');
const { initializeDatabase, seedDatabase } = require('./db/init');
const { ordersRouter } = require('./routes/orders');
const { profileRouter } = require('./routes/profile');

function createApp() {
  initializeDatabase();
  seedDatabase();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', dbFile: config.dbFile });
  });

  app.use('/api', ordersRouter);
  app.use('/api', profileRouter);

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}

module.exports = {
  createApp,
};
