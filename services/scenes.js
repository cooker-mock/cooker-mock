const path = require('path');
const fs = require('fs');
const { IO, MockAPI, Scene } = require('../io');

const io = new IO();

/**
 * create a new scene for a mock API
 * @param {string} apiId
 * @param {Object} data
 * @returns {Scene}
 */
const createScene = (apiId, data) => {
    const { scene, response } = data;
    const sceneInstance = new Scene(apiId, scene);
    
    if (scene) {
      try {
        sceneInstance.scene(response);
      } catch (error) {
        console.error('Failed to create mock API scene', error);
        throw error;
      }
    }
    return sceneInstance;
  };

module.exports = {
    createScene,
};