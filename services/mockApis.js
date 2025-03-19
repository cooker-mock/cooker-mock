/**
 * Mock API service
 *
 * @file services/mockApis.js
 * @module services/mockApis
 * @author Boyuan Zhang, <249454830>, <bzhang@algomau.ca>
 */
const { IO, MockAPI, Scene } = require('../io');
const io = new IO();

/**
 * Get all mock APIs
 *
 * @param {boolean} config.withResponse - whether include response data
 * @returns {Object[]} return all mock APIs
 */
const getMockApis = (config) => {
  const { withResponse } = config || {};

  const result = io
    .getAllApis()
    .map((apiId) => {
      const mockApi = new MockAPI(apiId);
      const config = mockApi.getConfig();

      if (config) {
        const sceneList = mockApi.sceneList;
        let response = null;
        if (withResponse) {
          const sceneInstance = new Scene(mockApi.id, config.scene);
          response = sceneInstance.getScene();
        }

        // Add ID, modification time, and other data
        return {
          id: mockApi.id,
          ...config,
          sceneList,
          response,
        };
      }
      return null;
    })
    .sort((a, b) => {
      const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
      const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
      return dateB - dateA;
    }) // sort by modification time in descending order
    .filter(Boolean); // filter null

  return result;
};

/**
 * Update a mock API by apiId and data
 *
 * @param {string} apiId
 * @param {Object} data
 * @returns {MockAPI}
 */
const updateMockApi = (apiId, data) => {
  const mockApi = new MockAPI(apiId);

  if (!apiId) {
    throw { errorCode: 'INVALID_ID', message: 'API ID is required' };
  }

  if (!mockApi.isValid()) {
    throw { errorCode: 'INVALID_API', message: 'API is invalid' };
  }

  try {
    const shouldUpdateLastModified = !('scene' in data);
    mockApi.setConfig(data, true, shouldUpdateLastModified);
  } catch (error) {
    console.error('Failed to update mock API', error);
    throw error;
  }
  return mockApi;
};

/**
 * create a mock API
 *
 * @param {Object} data
 * @returns {MockAPI}
 */
const createMockApi = (data) => {
  const { path, description, method, scene, response } = data;

  if (!path) {
    throw { errorCode: 'INVALID_PATH', message: 'Path is required' };
  }

  const apiId = MockAPI.createID(path);
  const mockApi = new MockAPI(apiId);

  try {
    mockApi.setConfig({ path, description, method, scene });
  } catch (error) {
    mockApi.delete();
    console.error('Failed to create mock API', error);
    throw error;
  }

  if (scene) {
    try {
      mockApi.scene = response;
    } catch (error) {
      console.error('Failed to create mock API scene', error);
      throw error;
    }
  }
  return mockApi;
};

/**
 * Delete a mock API by inputed apiId
 *
 * @param {string} apiId
 * @returns {MockAPI}
 */
const deleteMockApi = (apiId) => {
  if (!apiId) {
    throw { errorCode: 'INVALID_ID', message: 'API ID is required' };
  }
  const mockApi = new MockAPI(apiId);
  try {
    return mockApi.delete();
  } catch (error) {
    console.error('Failed to delete mock API', error);
    throw error;
  }
};

// Export all methods
module.exports = {
  getMockApis,
  createMockApi,
  updateMockApi,
  deleteMockApi,
};
