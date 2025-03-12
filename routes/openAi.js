const express = require('express');
const openAiController = require('../controllers/openAi');

const router = express.Router();

router.post('/ai-filling', openAiController.aiFilling);

module.exports = router;
