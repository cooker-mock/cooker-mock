#!/usr/bin/env node

const app = require('./app');
const config = require('./config');

function startServer() {
  app.listen(config.PORT, () => {
    console.log(`Cooker Mock Server running at http://localhost:${config.PORT}`);
  });
}

console.log('Starting Cooker mock server...');
startServer();
