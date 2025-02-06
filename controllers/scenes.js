/* The following service should be implemented:
router.put('/:apiId/:scene', scenesController.updateScene);
router.delete('/:apiId/:scene', scenesController.deleteScene);
*/

const services = require('../services');

/**
 * Get Scene Data by API ID and Scene Name
 */
exports.getSceneData = async (req, res) => {
  try {G
    const result = services.scenes.getSceneData();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load scene data.' });
  }
};

/**
 * Create a new scene for a mock API
 */
exports.createScene = async (req, res) => {
    try {
      const { apiId } = req.params;
      const { scene, response } = req.body;
      
      const result = services.scenes.createScene(apiId, {
        scene,
        response,
      });
      res.status(201).json({
                message: 'Mock API scene created successfully!',
                apiId,
                scene,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create scene.' });
    }
  };