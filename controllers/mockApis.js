const services = require('../services');

/**
 * Get all Mock-API, but only with config data, no scene data
 */
exports.getAllMockApis = async (req, res) => {
  try {
    const result = services.mockApis.getMockApis();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load mock APIs' });
  }
};

/**
 * Get all Mock-API, with the response data (currently actived scene data)
 * Mainly used for the cooker-proxy.js to consume this
 */
exports.getAllMockApisWithScene = async (req, res) => {
  try {
    const result = services.mockApis.getMockApis({ withResponse: true });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load mock APIs' });
  }
};

/**
 * Create a new Mock-API, with a default scene data(by 'response' parameter)
 */
exports.createMockApi = async (req, res) => {
  try {
    /**
     * path: string;
     * description: string;
     * method: string;
     * scene: string;
     * response: string;
     */
    const { path, description, method, scene, response } = req.body;
    const mockApi = services.mockApis.createMockApi({
      path,
      description,
      method,
      scene,
      response,
    });
    res.json({ message: 'Mock API created successfully!', id: mockApi.id });
  } catch (error) {
    console.error('Error creating mock API:', error);
    res.status(500).json({ error: 'Failed to create mock API' });
  }
};

/**
 * Update an existing Mock-API, but only the config data, no scene data
 */
exports.updateMockApi = async (req, res) => {
  try {
    const { apiId } = req.params;
    const { path, description, method, scene } = req.body;

    const params = { path, description, method };

    if (scene) {
      params.scene = scene;
    }

    const mockApi = services.mockApis.updateMockApi(apiId, params);

    res.json({ message: 'Mock API updated successfully!', id: mockApi.id });
  } catch (error) {
    console.error('Error updating mock API:', error);
    if (error.errorCode === 'INVALID_API') {
      return res.status(400).json({ error: 'Invalid API or API does not exists' });
    }
    res.status(500).json({ error: 'Failed to update mock API' });
  }
};

/**
 * Delete an existing Mock-API, will delete the folder of the API, including the scene data
 */
exports.deleteMockApi = async (req, res) => {
  try {
    const { apiId } = req.params;

    services.mockApis.deleteMockApi(apiId);

    res.json({ message: 'Mock API successfully deleted!' });
  } catch (error) {
    console.error(error);

    if (error.errorCode === 'FILE_NOT_EXIST') {
      return res.status(404).json({ error: 'Mock API not found' });
    }

    res.status(500).json({ error: 'Failed to delete mock API' });
  }
};
