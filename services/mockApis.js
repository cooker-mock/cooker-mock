const { IO, MockAPI, Scene } = require('../io');

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

  // Get all APIs and their modification times
  const apisWithModTime = io.getAllApisWithModTime();

  // Sort by modification time in descending order
  apisWithModTime.sort((a, b) => b.lastModified - a.lastModified);

  // Get the sorted API ID list
  const sortedApiIds = apisWithModTime.map((api) => api.id);

  const result = getMockApiInstances(sortedApiIds)
    .map((mockApi) => {
      const config = mockApi.config;
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
          lastModified: io.getApiLastModified(mockApi.id).toISOString(),
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
  deleteMockApi,
};
