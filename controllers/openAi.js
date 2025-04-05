/**
 * AI Filling a scene for a mock API
 * @author Boyuan Zhang, <249454830>, <bzhang@algomau.ca>
 */
const services = require('../services');

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
