/**
 * @fileoverview handle mock data read/write in file system of users' dev env.
 * @todo need more abstraction to handle mock data read/write, still to many low-level codes in the routes/api.js
 */

const fs = require('fs');
const path = require('path');
const { MOCK_DATA_ROOT_DIR_NAME, USER_PROJECT_PATH, MOCK_CONFIG_FILE_NAME } = require('../config');

const getMockDataRootPath = () => {
  const userProjectPath = USER_PROJECT_PATH
    ? path.resolve(process.cwd(), USER_PROJECT_PATH)
    : process.cwd();
  return path.join(userProjectPath, MOCK_DATA_ROOT_DIR_NAME);
};

/**
 * @param {string} uuid
 */
// const getApiIdbyUUID = (uuid) => {
//   const dirs = fs.readdirSync(getMockDataRootPath());
//   for (const dir of dirs) {
//     const match = dir.match(/ID_([\w\d]+)$/);
//     if (match && match[1] === uuid) {
//       return dir;
//     }
//   }
// };

/**
 * FileIO base class
 */
class FileIO {
  /**
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
   *
   * @param {string} filePath
   * @returns {Object} Parsed JSON, return null if file not exist
   */
  readJSONFile(filePath) {
    if (!fs.existsSync(filePath)) return null;

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
   *
   * @param {string} filePath
   * @param {Object} data Must be JSON serializable
   */
  writeJSONFile(filePath, data) {
    try {
      let content;
      try {
        content = JSON.stringify(data, null, 2);
      } catch (error) {
        console.error(`Failed to serialize data to JSON:`, error);
        throw error;
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error(`Error writing file ${filePath}:`, error);
      throw error;
    }
  }

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
 */
class IO extends FileIO {
  constructor() {
    super();
    this.root = getMockDataRootPath(); // Get the root path of the mock data folder first, this is where all mock data files stored
    this.ensureRootFolderExist();
  }

  ensureRootFolderExist() {
    fs.mkdirSync(this.root, { recursive: true });
  }

  /**
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
   * @deprecated
   */
  getApiFolderPath(apiId) {
    return path.join(this.root, apiId);
  }

  /**
   * @deprecated
   */
  getApiConfig(apiId) {
    return this.readJSONFile(this.getApiConfigFilePath(apiId));
  }

  /**
   * @deprecated
   */
  getApiConfigFilePath(apiId) {
    return path.join(this.getApiFolderPath(apiId), MOCK_CONFIG_FILE_NAME);
  }

  /**
   * @deprecated
   */
  getReturnSceneFilePath(apiId, scene) {
    return path.join(this.getApiFolderPath(apiId), `${scene}.json`);
  }
}

/**
 * Provide I/O API for a Mock-API
 */
class MockAPI extends IO {
  /**
   * Generate a unique ID for a new Mock-API
   * @param {string} path
   * @returns
   */
  static createID(path) {
    const UUID = Math.random().toString(36).substring(2, 8);
    return `http__${path.toLowerCase().replace(/\//g, '_')}_ID_${UUID}`;
  }

  constructor(apiId) {
    super();
    this.id = apiId;
    this.folderPath = path.join(this.root, apiId);
    this.configPath = path.join(this.folderPath, MOCK_CONFIG_FILE_NAME);
    this.ensureApiFolderExist();
  }

  ensureApiFolderExist() {
    fs.mkdirSync(this.folderPath, { recursive: true });
  }

  /**
   * Check if the Mock-API is valid
   */
  get valid() {
    const folder = fs.existsSync(this.folderPath);
    const config = fs.existsSync(this.configPath);
    const scene = fs.existsSync(this.sceneFilePath);

    if (!folder) {
      console.error(`MockAPI is invalid. Folder does not exist: ${this.folderPath}`);
    }
    if (!config) {
      console.error(`MockAPI is invalid. Config file does not exist: ${this.configPath}`);
    }
    if (!scene) {
      console.error(`MockAPI is invalid. Scene file does not exist: ${this.sceneFilePath}`);
    }

    return folder && config && scene;
  }

  get config() {
    return this.readJSONFile(this.configPath);
  }

  set config(data) {
    this.writeJSONFile(this.configPath, data);
  }

  /**
   * Get current actived scene file path
   */
  get sceneFilePath() {
    return path.join(this.folderPath, `${this.config.scene}.json`);
  }

  get scene() {
    return this.readFile(this.sceneFilePath);
  }

  /**
   *
   * @param {string} data
   */
  set scene(data) {
    this.writeFile(this.sceneFilePath, data);
  }

  /**
   * @returns {string[]} return all scene names in the folder
   */
  get sceneList() {
    return fs
      .readdirSync(this.folderPath)
      .filter((file) => fs.statSync(path.join(this.folderPath, file)).isFile())
      .map((file) => path.parse(file).name);
  }

  getSceneFilePath(scene) {
    return path.join(this.folderPath, `${scene}.json`);
  }

  /**
   * Get other scene file, if you want current actived scene, use `this.scene` getter
   * @param {string} scene scene name
   */
  getScene(scene) {
    return this.readFile(this.getSceneFilePath(scene));
  }

  /**
   * Update or create a scene file, if you want to update current actived scene, use `this.scene` setter
   * @param {string} scene scene name
   */
  setScene(scene, data) {
    this.writeFile(this.getSceneFilePath(scene), data);
    return this;
  }

  /**
   * Delete a scene file
   * @param {string} scene
   */
  delScene(scene) {
    this.deleteFile(this.getSceneFilePath(scene));
    return this;
  }

  /**
   * Delete all data of this Mock-API, including the folder
   */
  delete() {
    this.deleteFolder(this.folderPath);
    return this;
  }
}

module.exports = {
  FileIO,
  IO,
  MockAPI,
};
