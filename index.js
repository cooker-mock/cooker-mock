#!/usr/bin/env node
/**
 * Cooker Mock Server
 * 
 * @file index.js, the entry point of the application
 * @author Boyuan Zhang, <249454830>, <bzhang@algomau.ca>
 */
// import dependencies
const app = require('./app');
const config = require('./config');
const { IoWatcher } = require('./io');

/**
 * Start the server
 */
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
