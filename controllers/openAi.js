const services = require('../services');

/**
 * AI Filling a scene for a mock API
 */
exports.aiFilling = async (req, res) => {
  try {
    const { response } = req.body;

    const result = await services.openAi.aiFilling(response);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to AI Filling.' });
  }
};
