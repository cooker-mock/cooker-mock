#!/usr/bin/env node

require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const dataHandler = require('./io/dataHandler');

const app = express();
const PORT = process.env.PORT || 8088;

// Middleware
app.use(bodyParser.json());
app.use(cors());


const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

const reactBuildPath = path.join(__dirname, 'public', 'web-ui-build');
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
