/**
 * This file is the entry point of the application.
 * 
 * @file app.js
 * @author Boyuan Zhang, <249454830>, <bzhang@algomau.ca>
 */
// import dependencies
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');
const mockApis = require('./routes/mockApis');
const scenes = require('./routes/scenes');
const openAi = require('./routes/openAi');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Restful API Routes
app.use('/v1/mock-apis', mockApis);
app.use('/v1/scenes', scenes);
app.use('/v1/open-ai', openAi);

// configure correct MIME types
express.static.mime.define({
  'application/javascript': ['js', 'mjs'],
  'text/css': ['css'],
  'text/html': ['html'],
});

// static files path - public
app.use(
  express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.js') || path.endsWith('.mjs')) {
        res.set('Content-Type', 'application/javascript');
      }
      res.set('Cache-Control', 'no-cache');
    },
  })
);

// static files path - web ui
app.use(
  express.static(path.join(__dirname, config.WEB_UI_DIST_RELATIVE_PATH), {
    setHeaders: (res, path) => {
      if (path.endsWith('.js') || path.endsWith('.mjs')) {
        res.set('Content-Type', 'application/javascript');
      }
      res.set('Cache-Control', 'no-cache');
    },
  })
);

// Fallback other undefined routes to React App
app.get('*', (req, res) => {
  res.sendFile(path.join(path.join(__dirname, config.WEB_UI_DIST_RELATIVE_PATH), 'index.html'));
});

module.exports = app;
