const express = require('express');
const mockApisController = require('../controllers/mockApis');

const router = express.Router();

router.get('/', mockApisController.getAllMockApis);
router.get('/with-scene', mockApisController.getAllMockApisWithScene);
router.post('/', mockApisController.createMockApi);
router.put('/:apiId', mockApisController.updateMockApi);
router.put('/with-scene/:apiId', mockApisController.updateMockApiWithScene);
router.delete('/:apiId', mockApisController.deleteMockApi);

module.exports = router;
