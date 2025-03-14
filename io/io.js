/**
 * This module provides the IO class, which is responsible for reading and writing mock 
 * data/scene data from/to the file system directly.
 * 
 * @file io/io.js
 * @module io/io
 * @author Boyuan Zhang, <249454830>, <bzhang@algomau.ca>
 * @fileoverview handle mock data read/write in file system of users' dev env.
 * @todo need more abstraction to handle mock data read/write, still to many low-level codes in the routes/api.js
 */

const fs = require('fs');
const path = require('path');
const { MOCK_DATA_ROOT_DIR_NAME, USER_PROJECT_PATH } = require('../config');

/**
 *  Get the root path of the mock data folder
 */
const getMockDataRootPath = () => {
  const userProjectPath = USER_PROJECT_PATH
    ? path.resolve(process.cwd(), USER_PROJECT_PATH)
    : process.cwd();
  return path.join(userProjectPath, MOCK_DATA_ROOT_DIR_NAME);
};

/**
 * FileIO base class
 * 
 * @class
 */
class FileIO {
  /**
   * Read file from file system
   * 
   * @param {string} filePath
   * @returns {string} return file content, return null if file not exist
   */
  readFile(filePath) {
    if (!fs.existsSync(filePath)) return null;
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Write file to file system
   * 
   * @param {string} filePath
   * @param {string} data
   */
  writeFile(filePath, data) {
    try {
      fs.writeFileSync(filePath, data, 'utf8');
    } catch (error) {
      console.error(`Error writing file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Read JSON file from file system
   * 
   * @param {string} filePath
   * @returns {Object} Parsed JSON, return null if file not exist
   */
  readJSONFile(filePath) {
    if (!fs.existsSync(filePath)) return null;

    // Read file content and return parsed JSON
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      try {
        return JSON.parse(data);
      } catch (error) {
        console.error(`Error parsing JSON file ${filePath}:`, error);
        throw error;
      }
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Write JSON file to file system
   * 
   * @param {string} filePath
   * @param {Object} data Must be JSON serializable
   */
  writeJSONFile(filePath, data) {
    try {
      let content = data;
      try {
        if (typeof data === 'string') {
          content = JSON.parse(data);
        }
      } catch (error) {
        console.error(`Failed to serialize data to JSON:`, error);
        throw error;
      }
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
    } catch (error) {
      console.error(`Error writing file ${filePath}:`, error);
      throw error;
    }
  }
  /**
   * Delete file from file system
   * 
   * @param {string} filePath 
   */
  deleteFile(filePath) {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
        throw error;
      }
    } else {
      throw {
        errorCode: 'FILE_NOT_EXIST',
        message: `File not exist: ${filePath}`,
      };
    }
  }
  /**
   * Delete folder from file system
   * 
   * @param {string} folderPath 
   */
  deleteFolder(folderPath) {
    if (fs.existsSync(folderPath)) {
      try {
        fs.rmSync(folderPath, { recursive: true });
      } catch (error) {
        console.error(`Error deleting folder ${folderPath}:`, error);
        throw error;
      }
    } else {
      throw {
        errorCode: 'FILE_NOT_EXIST',
        message: `Folder not exist: ${folderPath}`,
      };
    }
  }
}

/**
 * handle Mock-API I/O in file system
 * 
 * @class
 */
class IO extends FileIO {
  /**
   * class IO is responsible for supporting the I/O operations of the mock data in the file system.
   * 
   * @constructor
   * 
   */
  constructor() {
    super();
    this.root = getMockDataRootPath(); // Get the root path of the mock data folder first, this is where all mock data files stored
    this.ensureRootFolderExist();
  }
  /**
   * Ensures that the root folder exists and contains necessary configuration files.
   * If the root folder does not exist, it will be created.
   * If the root folder does not exist, it will be created.
   */
  ensureRootFolderExist() {
    // Create the root folder if it does not exist (recursive ensures parent directories are created)
    fs.mkdirSync(this.root, { recursive: true });
    // Ensure the .env file exists, create it with a placeholder if missing
    if (!fs.existsSync(path.join(this.root, '.env'))) {
      fs.writeFileSync(path.join(this.root, '.env'), `OPENAI_API_KEY=`, 'utf8');
    }
    // Ensure the .gitignore file exists, add `.env` to it if missing
    if (!fs.existsSync(path.join(this.root, '.gitignore'))) {
      fs.writeFileSync(path.join(this.root, '.gitignore'), `.env`, 'utf8');
    }
    // Ensure the .npmignore file exists, add `.env` to it if missing
    if (!fs.existsSync(path.join(this.root, '.npmignore'))) {
      fs.writeFileSync(path.join(this.root, '.npmignore'), `.env`, 'utf8');
    }
  }

  /**
   * Get the paths of APIs
   * 
   * @returns {string[]} return all API ids, in the root path
   */
  getAllApis() {
    if (!fs.existsSync(this.root)) {
      return [];
    }

    return fs
      .readdirSync(this.root)
      .filter((file) => fs.statSync(path.join(this.root, file)).isDirectory());
  }

  /**
   * Get the last modified time of an API from the modification time of the API folder
   * 
   * @param {string} apiId API's ID
   * @returns {Date} last modified time
   */
  getApiLastModified(apiId) {
    const apiPath = path.join(this.root, apiId);
    if (!fs.existsSync(apiPath)) {
      return new Date(0);
    }

    // Get the modification time of the API folder
    try {
      const stat = fs.statSync(apiPath);
      return stat.mtime;
    } catch (error) {
      console.error(`Failed to get modification time for API ${apiId}:`, error);
      return new Date(0);
    }
  }

  /**
   * Get all APIs and their modification times
   * 
   * @returns {Array<{id: string, lastModified: Date}>} API list and modification times
   */
  getAllApisWithModTime() {
    const apiIds = this.getAllApis();

    return apiIds.map((apiId) => ({
      id: apiId,
      lastModified: this.getApiLastModified(apiId),
    }));
  }

  /**
   * Get the OpenAI API key from the .env file
   * 
   * @returns {string} OpenAI API key
   */
  getOpenAIAPIKey() {
    try {
      const envFilePath = path.join(this.root, '.env');

      if (!fs.existsSync(envFilePath)) {
        console.warn('No .env file found in project root');
        return null;
      }

      const envContent = fs.readFileSync(envFilePath, 'utf8');

      const match = envContent.match(/OPENAI_API_KEY=([^\r\n]+)/);
      if (match && match[1]) {
        return match[1].trim();
      }

      console.warn('OPENAI_API_KEY not found in .env file');
      return null;
    } catch (error) {
      console.error('Error reading OPENAI_API_KEY from .env file:', error);
      return null;
    }
  }
}

module.exports = {
  FileIO,
  IO,
  getMockDataRootPath,
};
