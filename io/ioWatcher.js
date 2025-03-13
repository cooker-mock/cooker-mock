const WebSocket = require('ws');
const chokidar = require('chokidar');
const { IO } = require('./io');
const config = require('../config');

class IoWatcher extends IO {
  constructor() {
    super();
    this.watcher = chokidar.watch(this.root, {
      persistent: true,
      awaitWriteFinish: true,
    });
  }

  initWebSocketServer = () => {
    const wss = new WebSocket.Server({ port: config.WEBSOCKET_PORT });

    console.log(`WebSocket server running at port ${config.WEBSOCKET_PORT}`);

    wss.on('connection', (ws) => {
      console.log('WebSocket client connected');

      // listen file change event
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
