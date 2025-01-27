const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const uuidv4 = require('uuid').v4;
const dataHandler = require('../io/dataHandler');

const mockDataDir = dataHandler.getMockDataPath();
const getApiFolderPath = (apiId) => path.join(mockDataDir, apiId);
const getConfigFilePath = (apiId) => path.join(getApiFolderPath(apiId), '.config');

const readFile = (filePath) => {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const writeFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

const deleteFolderRecursive = (folderPath) => {
  if (fs.existsSync(folderPath)) {
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

const createOrUpdateMockApi = (apiId, apiPath, description, method, scene, response, res) => {
  const cookerTempPath = path.join(__dirname, '.cookerTemp');
  const tempFolderPath = path.join(cookerTempPath, uuidv4());
  const apiFolderPath = getApiFolderPath(apiId);

  try {
    fs.mkdirSync(tempFolderPath, { recursive: true }); // temp folder, transactional

    const config = {
      path: apiPath,
      description,
      method,
      scene,
    };

    writeFile(path.join(tempFolderPath, '.config'), config);

    const sceneFilePath = path.join(tempFolderPath, `${scene}.json`);
    try {
      const jsonResponse = JSON.parse(response);
      writeFile(sceneFilePath, jsonResponse);
    } catch (error) {
      deleteFolderRecursive(tempFolderPath);
      return res.status(400).json({ error: 'Invalid JSON response' });
    }

    fs.mkdirSync(path.dirname(apiFolderPath), { recursive: true });

    fs.renameSync(tempFolderPath, apiFolderPath);

    res.json({ message: 'Mock API created successfully!', id: apiId });
  } catch (error) {
    deleteFolderRecursive(tempFolderPath);
    console.error(error);
    res.status(500).json({ error: 'Failed to create mock API' });
  } finally {
    if (fs.existsSync(cookerTempPath) && fs.readdirSync(cookerTempPath).length === 0) {
      fs.rmdirSync(cookerTempPath);
    }
  }
};

router.get('/mock', (req, res) => {
  try {
    if (!fs.existsSync(mockDataDir)) {
      res.json([]);
      return;
    }

    const mockDirs = fs.readdirSync(mockDataDir).filter((file) =>
      fs.statSync(path.join(mockDataDir, file)).isDirectory()
    );

    const apis = mockDirs.map((dir) => {
      const config = readFile(getConfigFilePath(dir));
      if (config) {
        const sceneFilePath = path.join(getApiFolderPath(dir), `${config.scene}.json`);
        const sceneData = readFile(sceneFilePath);
        return { id: dir, ...config, response: JSON.stringify(sceneData) };
      }
      return null;
    }).filter(Boolean);

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

  createOrUpdateMockApi(apiId, apiPath, description, method, scene, response, res);
});

router.put('/mock/:id', (req, res) => {
  const apiId = req.params.id;
  const configFilePath = getConfigFilePath(apiId);

  if (!fs.existsSync(configFilePath)) {
    return res.status(404).json({ error: 'Mock API not found' });
  }

  const { path: apiPath, description, method, scene, response } = req.body;

  createOrUpdateMockApi(apiId, apiPath, description, method, scene, response, res);
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