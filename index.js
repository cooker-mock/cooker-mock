#!/usr/bin/env node

const app = require('./app');
const config = require('./config');
const { IoWatcher } = require('./io');

function startServer() {
  app.listen(config.PORT, () => {
    console.log(`Cooker Mock Server running at http://localhost:${config.PORT}`);
  });

  const ioWatcher = new IoWatcher();
  console.log('Starting IO Watcher...');
  ioWatcher.initWebSocketServer();
}

console.log('Starting Cooker mock server...');
startServer();
