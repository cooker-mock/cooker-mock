const path = require('path');
const fs = require('fs');
const { IO, MockAPI } = require('../io');

const io = new IO();

/**
 *
 * @param {string[]} apiIds
 * @returns {MockAPI[]}
 */
const getMockApiInstances = (apiIds) => {
  return apiIds.map((apiId) => new MockAPI(apiId));
};

/**
 * @param {boolean} config.withResponse - whether include response data
 * @returns {Object[]} return all mock APIs
 */
const getMockApis = (config) => {
  const { withResponse } = config || {};
  const allApis = io.getAllApis();
  const result = getMockApiInstances(allApis)
    .map((mockApi) => {
      const config = mockApi.config;
      if (config) {
        const sceneList = mockApi.sceneList;
        let response = null;
        if (withResponse) {
          response = mockApi.scene;
        }

        // add ID, assemble data
        return {
          id: mockApi.id,
          ...config,
          sceneList,
          response,
        };
      }
      return null;
    })
    .filter(Boolean); // filter null

  return result;
};

/**
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

  if (!mockApi.valid) {
    throw { errorCode: 'INVALID_API', message: 'API is invalid' };
  }

  try {
    mockApi.config = data;
  } catch (error) {
    console.error('Failed to update mock API', error);
    throw error;
  }
  return mockApi;
};

/**
 * @deprecated 即将废弃
 * @param {string} apiId
 * @param {Object} data
 * @returns {MockAPI}
 */
const updateMockApiWithScene = (apiId, data) => {
  const mockApi = updateMockApi(apiId, data);
  return mockApi.setScene(mockApi.config.scene, data.response);
};

/**
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
    mockApi.config = { path, description, method, scene };
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

module.exports = {
  getMockApis,
  getMockApiInstances,
  createMockApi,
  updateMockApi,
  updateMockApiWithScene,
  deleteMockApi,
};
