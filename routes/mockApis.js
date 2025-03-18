/**
 * define routes for mock apis
 * 
 * @file routes/mockApis.js
 * @module routes/mockApis
 * @author Boyuan Zhang, <249454830>, <bzhang@algomau.ca>
 */
const express = require('express');
const mockApisController = require('../controllers/mockApis');
const router = express.Router();

router.get('/', mockApisController.getAllMockApis);
router.get('/with-scene', mockApisController.getAllMockApisWithScene);
router.post('/', mockApisController.createMockApi);
router.put('/:apiId', mockApisController.updateMockApi);
router.delete('/:apiId', mockApisController.deleteMockApi);

module.exports = router;
