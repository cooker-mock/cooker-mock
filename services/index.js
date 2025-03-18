/**
 * The index file for the services module.
 * 
 * @file services/index.js
 * @module services
 * @author Boyuan Zhang, <249454830>, <bzhang@algomau.ca>
 */
const mockApis = require('./mockApis');
const scenes = require('./scenes');
const openAi = require('./openAi');

module.exports = {
  mockApis,
  scenes,
  openAi,
};
