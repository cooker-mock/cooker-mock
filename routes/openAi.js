/**
 * routes for openAi
 * 
 * @file routes/openAi.js
 * @module routes/openAi
 * @author Boyuan Zhang, <249454830>, <bzhang@algomau.ca>
 */
const express = require('express');
const openAiController = require('../controllers/openAi');
const router = express.Router();

router.post('/ai-filling', openAiController.aiFilling);

module.exports = router;
