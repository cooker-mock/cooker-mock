const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const dataHandler = require('../io/dataHandler');
const { MOCK_CONFIG_FILE_NAME } = require('../constants');

const mockDataRootDir = dataHandler.getMockDataRootPath();
const getApiFolderPath = (apiId) => path.join(mockDataRootDir, apiId);
const getConfigFilePath = (apiId) =>
  path.join(getApiFolderPath(apiId), '.config');

const readFile = (filePath) => {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const writeFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

const deleteFolderRecursive = (folderPath) => {
  if (fs.existsSync) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
};

const createOrUpdateMockApi = ({
  apiId,
  apiPath,
  description,
  method,
  scene,
  response,
  res,
  on,
}) => {
  const apiFolderPath = path.join(mockDataRootDir, apiId);

  try {
    fs.mkdirSync(apiFolderPath, { recursive: true });

    const configFilePath = path.join(apiFolderPath, MOCK_CONFIG_FILE_NAME);
    const sceneFilePath = path.join(apiFolderPath, `${scene}.json`);

    const config = {
      path: apiPath,
      description,
      method,
      scene,
      headers: headers || {},
      queryParams: queryParams || {},
    };

    try {
      const jsonResponse = JSON.parse(response);
      writeFile(sceneFilePath, jsonResponse);
      writeFile(configFilePath, config);
    } catch (error) {
      if (on === 'creating') {
        deleteFolderRecursive(apiFolderPath);
      }
      return res.status(400).json({ error: 'Invalid JSON response' });
    }

    res.json({ message: 'Mock API created/updated successfully!', id: apiId });
  } catch (error) {
    console.error('Error creating/updating mock API:', error);
    res.status(500).json({ error: 'Failed to create/update mock API' });
  }
};

router.get('/mock', (req, res) => {
  try {
    if (!fs.existsSync(mockDataRootDir)) {
      res.json([]);
      return;
    }

    const mockDirs = fs
      .readdirSync(mockDataRootDir)
      .filter((file) =>
        fs.statSync(path.join(mockDataRootDir, file)).isDirectory()
      );

    const apis = mockDirs
      .map((dir) => {
        const config = readFile(getConfigFilePath(dir));
        if (config) {
          const sceneFilePath = path.join(
            getApiFolderPath(dir),
            `${config.scene}.json`
          );
          const sceneData = readFile(sceneFilePath);
          return { id: dir, ...config, response: JSON.stringify(sceneData) };
        }
        return null;
      })
      .filter(Boolean);

    res.json(apis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load mock APIs' });
  }
});

router.post('/mock', (req, res) => {
  const { path: apiPath, description, method, scene, response } = req.body;
  const apiId = `http__${apiPath.replace(/\//g, '.')}_ID_${Math.random()
    .toString(36)
    .substring(2, 6)}`;

  createOrUpdateMockApi({
    apiId,
    apiPath,
    description,
    method,
    scene,
    response,
    res,
    on: 'creating',
  });
});

router.put('/mock/:id', (req, res) => {
  const apiId = req.params.id;
  const configFilePath = getConfigFilePath(apiId);

  if (!fs.existsSync(configFilePath)) {
    return res.status(404).json({ error: 'Mock API not found' });
  }

  const { path: apiPath, description, method, scene, response } = req.body;

  createOrUpdateMockApi({
    apiId,
    apiPath,
    description,
    method,
    scene,
    response,
    res,
    on: 'updating',
  });
});

router.get('/mock/:id/scenes', (req, res) => {
  const apiId = req.params.id;
  const apiFolderPath = getApiFolderPath(apiId);

  if (!fs.existsSync(apiFolderPath)) {
    return res.status(404).json({ error: 'Api not found' });
  }

  const files = fs.readdirSync(apiFolderPath);
  const sceneFiles = files.filter(file => file.endsWith('.json') && file !== '.config');

  const scenes = sceneFiles.map(file => file.replace('.json', ''));

  res.json({ scenes });
});

router.put('/mock/:id/scenes', (req, res) => {
  const apiId = req.params.id;
  const { scenes } = req.body;

  const configFilePath = getConfigFilePath(apiId);
  if (!fs.existsSync(configFilePath)) {
    return res.status(404).json({ error: 'Api not found' });
  }

  const config = readFile(configFilePath);
  if (!config) {
    return res.status(500).json({ error: 'Failed to read config' });
  }

  config.scenes = scenes;

  writeFile(configFilePath, config);
  res.json({ message: 'Scenes update success' });
});

router.put('/mock/:id/scene', (req, res) => {
  const apiId = req.params.id;
  const { scene } = req.body;

  const configFilePath = getConfigFilePath(apiId);
  if (!fs.existsSync(configFilePath)) {
    return res.status(404).json({ error: 'API not found' });
  }

  const config = readFile(configFilePath);
  if (!config) {
    return res.status(500).json({ error: 'Failed to read config' });
  }

  config.scene = scene;

  writeFile(configFilePath, config);
  res.json({ message: `Scene switched to ${scene}` });
});


router.delete('/mock/:id', (req, res) => {
  try {
    const apiId = req.params.id;
    const apiFolderPath = getApiFolderPath(apiId);

    if (!fs.existsSync(apiFolderPath)) {
      return res.status(404).json({ error: 'Mock API not found' });
    }

    deleteFolderRecursive(apiFolderPath);

    res.json({ message: 'Mock API successfully deleted!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete mock API' });
  }
});

module.exports = router;
