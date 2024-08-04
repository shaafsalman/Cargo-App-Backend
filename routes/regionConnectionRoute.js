const express = require('express');
const regionConnectionController = require('../controllers/regionConnectionController');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        console.log("Route: GET / - Fetch all connections");
        await regionConnectionController.getAllConnections(req, res);
    } catch (err) {
        console.error('Error in connectionRoutes:', err.message);
        next(err); 
    }
});
router.post('/add',  async (req, res, next) => {
    try {
      console.log("Route: POST /add - Create new connection");
      console.log('Request body:', req.body);
      const {  fromRegionId,
        toRegionId,
        distance } = req.body;
      regionData ={   fromRegionId,
        toRegionId,
        distance };
      
      const resultMessage = await regionConnectionController.addConnection(regionData);
       res.status(201).json({ message: resultMessage.message });
    } 
    catch (err) 
    {
        console.log("im here");
        console.error('Error creating connection:', err.message);
        res.status(400).json({ error: err.message });
        next(err);
    }
  });
  router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        console.log(`Route: DELETE /${id} - Delete Route`);
        const result = await regionConnectionController.deleteConnection(id);
        if (!result) {
            return res.status(404).json({ error: 'Route not found' });
        }
        res.json({ message: 'Route deleted successfully' });
    } catch (err) {
        console.error(`Error deleting Route with ID ${id}:`, err.message);
        next(err);
    }
});



router.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).json({ error: 'Internal Server Error' }); // Respond with a 500 Internal Server Error
});

module.exports = router;