/**
 * @fileoverview handle mock data read/write in file system of users' dev env.
 * @todo need more abstraction to handle mock data read/write, still to many low-level codes in the routes/api.js
 */

const fs = require('fs');
const path = require('path');
const { MOCK_DATA_ROOT_DIR_NAME } = require('../constants');

const getMockDataRootPath = () => {
  const userProjectPath = process.env.USER_PROJECT_PATH
    ? path.resolve(process.cwd(), process.env.USER_PROJECT_PATH)
    : process.cwd();
  return path.join(userProjectPath, MOCK_DATA_ROOT_DIR_NAME);
};

class DataHandler {
  constructor() {
    this.root = getMockDataRootPath(); // Get the root path of the mock data folder first, this is where all mock data files stored
    this.ensureRootFolderExist();
  }

  ensureRootFolderExist() {
    fs.mkdirSync(this.root, { recursive: true });
  }

  create(data) {
    const { path, description, method, scene, response } = data;
    const filePath = path.join(this.root, `${path.replace(/\//g, '_')}.json`);

    const mockData = {
      path,
      description,
      method,
      scenes: scenes || [],
    };

    writeMockData(filePath, mockData);
  }

  read(where) {
    const { id, method, path } = where;
  }

  update(where, data) {
    const { id } = where;
  }

  delete(where) {
    const { id } = where;
  }
}

const ensureMockDataFolder = (mockDataPath) => {
  fs.mkdirSync(mockDataPath, { recursive: true });
};

const readMockData = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return { endpoints: [] };
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading mock data:', error);
    throw error;
  }
};

const writeMockData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing mock data:', error);
    throw error;
  }
};

module.exports = {
  DataHandler,
  getMockDataRootPath,
  ensureMockDataFolder,
  readMockData,
  writeMockData,
};
