const { config } = require('./config/env');
const { createApp } = require('./app');

const app = createApp();

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
