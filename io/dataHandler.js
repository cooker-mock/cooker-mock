/**
 * @fileoverview handle mock data read/write in file system of users' dev env.
 */

const fs = require('fs');
const path = require('path');

function getMockDataPath() {
  const userProjectPath = process.env.USER_PROJECT_PATH
    ? path.resolve(process.cwd(), process.env.USER_PROJECT_PATH)
    : process.cwd();
  return path.join(userProjectPath, process.env.MOCK_DIR_NAME);
}

function ensureMockDataFolder(mockDataPath) {
  fs.mkdirSync(mockDataPath, { recursive: true });
}

function readMockData(filePath) {
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
}

function writeMockData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing mock data:', error);
    throw error;
  }
}

module.exports = {
  getMockDataPath,
  ensureMockDataFolder,
  readMockData,
  writeMockData,
};
