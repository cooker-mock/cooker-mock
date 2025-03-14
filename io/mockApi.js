/**
 * handle Mock-API I/O in file system.
 *
 * @fileoverview handle mock data read/write in file system.
 * @todo need more abstraction to handle mock data read/write, still to many low-level codes in the routes/api.js
 * @author Boyuan Zhang, <249454830>, <bzhang@algomau.ca>
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
   * 
   * @param {string} path - the path of the Mock-API
   * @returns {string} return a unique ID
   */
  static createID(path) {
    const UUID = Math.random().toString(36).substring(2, 8);
    return `http__${path.toLowerCase().replace(/\//g, '_').slice(0, 10)}_ID_${UUID}`;
  }

  /**
   * 
   * @constructor create a new Mock-API instance
   * @param {string} apiId - the ID of the Mock-API
   */
  constructor(apiId) {
    super();
    this.id = apiId;
    this.folderPath = path.join(this.root, apiId);
    this.configPath = path.join(this.folderPath, MOCK_CONFIG_FILE_NAME);
    this.ensureApiFolderExist();
  }

  /**
   * Ensure the folder of the Mock-API exists
   */
  ensureApiFolderExist() {
    fs.mkdirSync(this.folderPath, { recursive: true });
  }

  /**
   * Check if the Mock-API is valid
   */
  get valid() {
    const folder = fs.existsSync(this.folderPath);
    const config = fs.existsSync(this.configPath);

    // folder and config file should exist
    if (!folder) {
      console.error(`MockAPI is invalid. Folder does not exist: ${this.folderPath}`);
    }
    if (!config) {
      console.error(`MockAPI is invalid. Config file does not exist: ${this.configPath}`);
    }

    return folder && config;
  }

  /**
   * Get the config data of the Mock-API
   * 
   * @returns {Object} return the json
   */
  get config() {
    return this.readJSONFile(this.configPath);
  }

  /**
   * Set the config data of the Mock-API
   * 
   * @param {Object} data - the data to be written to json config file
   */
  set config(data) {
    this.writeJSONFile(this.configPath, data);
  }

  /**
   * Get the scene datas of a Mock-API
   * 
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
   * 
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
