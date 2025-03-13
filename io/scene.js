/**
 * @fileoverview handle mock data read/write in file system of users' dev env.
 * @todo need more abstraction to handle mock data read/write, still to many low-level codes in the routes/api.js
 */

const fs = require('fs');
const path = require('path');
const { IO } = require('./io');

class Scene extends IO {
  constructor(apiId, scene) {
    super();
    this.apiId = apiId;
    this.scene = scene;
    this.folderPath = path.join(this.root, apiId);
    this.sceneFilePath = path.join(this.folderPath, `${scene}.json`);
    this.ensureSceneFolderExist();
  }

  ensureSceneFolderExist() {
    fs.mkdirSync(this.folderPath, { recursive: true });
  }

  /**
   * get current scene data
   * @returns {string} return scene data, return null if file not exist
   */
  getScene() {
    return this.readFile(this.sceneFilePath);
  }

  /**
   * set scene data to current scene file
   * @param {string} data
   */
  setScene(data) {
    this.writeJSONFile(this.sceneFilePath, data);

    const api = new MockAPI(this.apiId);
    if (!api.config.scene) {
      api.updateSceneSelected(this.scene);
    }

    return this;
  }

  /**
   * delete current scene file
   */
  delete() {
    this.deleteFile(this.sceneFilePath);

    const api = new MockAPI(this.apiId);
    if (api.sceneList.length < 1) {
      api.updateSceneSelected(null);
    }

    return this;
  }
}

module.exports = Scene;
