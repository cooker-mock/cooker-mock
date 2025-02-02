const express = require('express');
const router = express.Router();

// Example Code:
// router.get('/mock/:id', (req, res) => {
//   const apiId = req.params.id;
//   const configFilePath = getConfigFilePath(apiId);

//   if (!fs.existsSync(configFilePath)) {
//     return res.status(404).json({ error: 'Mock API not found' });
//   }
// });

module.exports = router;
