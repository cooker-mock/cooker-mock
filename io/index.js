/**
 * io module index file
 * 
 * @file io/index.js
 * @module io
 * @author Boyuan Zhang, <249454830>, <bzhang@algomau.ca>
 */
const { IO, FileIO, getMockDataRootPath } = require('./io');
const MockAPI = require('./mockApi');
const Scene = require('./scene');
const IoWatcher = require('./ioWatcher');

module.exports = {
  IO,
  FileIO,
  getMockDataRootPath,
  MockAPI,
  Scene,
  IoWatcher,
};
