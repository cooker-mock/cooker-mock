const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');
const mockApis = require('./routes/mockApis');
const scenes = require('./routes/scenes');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Restful API Routes
app.use('/v1/mock-apis', mockApis);
app.use('/v1/scenes', scenes);

// Static files Routes
app.use(express.static(path.join(__dirname, 'public')));
// Fallback other undefined routes to React App
app.get('*', (req, res) => {
  res.sendFile(path.join(path.join(__dirname, config.WEB_UI_DIST_RELATIVE_PATH), 'index.html'));
});

module.exports = app;
