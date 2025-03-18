/**
 * scenec service
 * 
 * @file services/scenes.js
 * @module services/scenes
 * @author Lin Zhao, <249416700>, <lizhao@algomau.ca>
 */
const { Scene } = require('../io');

/**
 * create a new scene for a mock API
 * 
 * @param {string} apiId
 * @param {Object} data
 * @returns {Scene}
 */
const createScene = (apiId, data) => {
  const { scene, response } = data;
  const sceneInstance = new Scene(apiId, scene);

  if (scene) {
    try {
      sceneInstance.setScene(response);
    } catch (error) {
      console.error('Failed to create mock API scene', error);
      throw error;
    }
  }
  return sceneInstance;
};

/**
 * get Scene Data by API ID and Scene Name
 * 
 * @param {string} apiId
 * @param {string} scene
 * @returns {Scene}
 */
const getSceneData = (apiId, scene) => {
  const sceneInstance = new Scene(apiId, scene);
  return sceneInstance.getScene();
};

/**
 * Delete a scene for a mock API
 * 
 * @param {string} apiId
 * @param {string} scene
 * @returns {Scene}
 */
const deleteScene = (apiId, scene) => {
  const sceneInstance = new Scene(apiId, scene);
  return sceneInstance.delete();
};

/**
 * update a scene for a mock API
 * 
 * @param {string} apiId
 * @param {string} scene
 * @param {Object} response
 * @returns {Scene}
 */
const updateScene = (apiId, scene, response) => {
  const sceneInstance = new Scene(apiId, scene);
  return sceneInstance.setScene(response);
};

module.exports = {
  createScene,
  getSceneData,
  deleteScene,
  updateScene,
};
