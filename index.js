#!/usr/bin/env node

require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const dataHandler = require('./io/dataHandler');

const app = express();
const PORT = process.env.PORT || 8088;
const WEB_UI_DIST_RELATIVE_PATH = process.env.WEB_UI_DIST_RELATIVE_PATH;

// Middleware
app.use(bodyParser.json());
app.use(cors());


const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

const reactBuildPath = path.join(__dirname, WEB_UI_DIST_RELATIVE_PATH);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(reactBuildPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(reactBuildPath, 'index.html'));
});


function startServer() {
  app.listen(PORT, () => {
    console.log(`Cooker Mock Server running at http://localhost:${PORT}`);
  });
}

console.log('Starting Cooker mock server...');
startServer();
