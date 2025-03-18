/**
 * This module is responsible for watching file changes and notifying clients via WebSocket.
 * 
 * @file io/ioWatcher.js
 * @module io/ioWatcher
 * @author Boyuan Zhang, <249454830>, <bzhang@algomau.ca>
 */
const WebSocket = require('ws');
const chokidar = require('chokidar');
const { IO } = require('./io');
const config = require('../config');

/**
 * Class representing a file watcher
 * 
 * @extends IO
 * @class
 */
class IoWatcher extends IO {
  /**
   * Constructor for IoWatcher
   * Initializes a file watcher using Chokidar.
   */
  constructor() {
    super();

    // Initialize Chokidar watcher for monitoring file changes
    this.watcher = chokidar.watch(this.root, {
      persistent: true,
      awaitWriteFinish: true,
    });
  }

  /**
   * Initializes the WebSocket server to notify clients about file changes.
   */
  initWebSocketServer = () => {
    const wss = new WebSocket.Server({ port: config.WEBSOCKET_PORT });

    console.log(`WebSocket server running at port ${config.WEBSOCKET_PORT}`);

    wss.on('connection', (ws) => {
      console.log('WebSocket client connected');

      /**
       * Handles file change events.
       * Sends a JSON message to the WebSocket client when a file is added, changed, or deleted.
       * 
       * @param {string} path - The path of the file that changed.
       */
      const fileChangeHandler = (path) => {
        console.log(`File changed: ${path}`);
        ws.send(
          JSON.stringify({
            type: 'FILE_CHANGE',
            path: path,
            timestamp: new Date().toISOString(),
          })
        );
      };

      // add file change listener
      this.watcher.on('add', fileChangeHandler);
      this.watcher.on('change', fileChangeHandler);
      this.watcher.on('unlink', fileChangeHandler);

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        // remove listener to avoid memory leak
        this.watcher.removeListener('add', fileChangeHandler);
        this.watcher.removeListener('change', fileChangeHandler);
        this.watcher.removeListener('unlink', fileChangeHandler);
      });
    });
  };
}

module.exports = IoWatcher;
