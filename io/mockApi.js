/**
 * @fileoverview handle mock data read/write in file system of users' dev env.
 * @todo need more abstraction to handle mock data read/write, still to many low-level codes in the routes/api.js
 */

const fs = require('fs');
const path = require('path');
const { IO } = require('./io');
const { MOCK_CONFIG_FILE_NAME } = require('../config');

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
    return `http__${path.toLowerCase().replace(/\//g, '_').slice(0, 10)}_ID_${UUID}`;
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

    if (!folder) {
      console.error(`MockAPI is invalid. Folder does not exist: ${this.folderPath}`);
    }
    if (!config) {
      console.error(`MockAPI is invalid. Config file does not exist: ${this.configPath}`);
    }

    return folder && config;
  }

  get config() {
    return this.readJSONFile(this.configPath);
  }

  set config(data) {
    this.writeJSONFile(this.configPath, data);
  }

  /**
   * @returns {string[]} return all scene names in the folder
   */
  get sceneList() {
    return fs
      .readdirSync(this.folderPath)
      .filter(
        (file) =>
          fs.statSync(path.join(this.folderPath, file)).isFile() && file !== MOCK_CONFIG_FILE_NAME
      )
      .map((file) => path.parse(file).name);
  }

  /**
   * Update the selected scene in the config file
   * @param {string} scene
   */
  updateSceneSelected(scene) {
    if (scene === null) {
      const config = this.config;
      delete config.scene;
      this.writeJSONFile(this.configPath, config);
    } else {
      this.writeJSONFile(this.configPath, {
        ...this.config,
        scene,
      });
    }
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

module.exports = MockAPI;
