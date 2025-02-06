const express = require('express');
const scenesController = require('../controllers/scenes');

const router = express.Router();

router.get('/:apiId/:scene', scenesController.getSceneData);
router.post('/:apiId', scenesController.createScene);
//router.put('/:apiId/:scene', scenesController.updateScene);
//router.delete('/:apiId/:scene', scenesController.deleteScene);

module.exports = router;
