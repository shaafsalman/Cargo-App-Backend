const express = require('express');
const regionController = require('../controllers/regionController');

const router = express.Router();

// GET all regions
router.get('/', async (req, res, next) => {
    try {
        console.log("Route: GET / - Fetch all regions");
        await regionController.getAllRegions(req, res);
    } catch (err) {
        console.error('Error in regionsRoute:', err.message);
        next(err); 
    }
});

// GET region by ID
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: GET /${id} - Fetch region by ID`);
        const region = await regionController.getRegionById(id);
        if (!region) {
            return res.status(404).json({ error: 'Region not found' });
        }
        res.json(region);
    } catch (err) {
        console.error(`Error fetching region with ID ${id}:`, err.message);
        next(err);
    }
});

router.post('/add',  async (req, res, next) => {
    try {
      console.log("Route: POST /add - Create new region");
      console.log('Request body:', req.body);
      const { regionname, regioncode,tax,charges,taxCurrency } = req.body;
      regionData ={  regionname, regioncode,tax,charges,taxCurrency };
      
      const resultMessage = await regionController.createRegion(regionData);
       res.status(201).json({ message: resultMessage.message });
    } 
    catch (err) 
    {
        console.log("im here");
        console.error('Error creating region:', err.message);
        res.status(400).json({ error: err.message });
        next(err);
    }
  });

// PUT update a region
router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const regionData = req.body;
    try {
        console.log(`Route: PUT /${id} - Update region`);
        const updatedRegion = await regionController.updateRegion(id, regionData);
        res.json(updatedRegion);
    } catch (err) {
        console.error('Error updating region:', err.message);
        res.status(400).json({ error: err.message });
        next(err);
    }
});
// DELETE a region
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        console.log(`Route: DELETE /${id} - Delete region`);
        const result = await regionController.deleteRegion(id);
        if (!result) {
            return res.status(404).json({ error: 'Region not found' });
        }
        res.json({ message: 'Region deleted successfully' });
    } catch (err) {
        console.error(`Error deleting eegion with ID ${id}:`, err.message);
        next(err);
    }
});

// Error handling middleware - this middleware should be defined last
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = router;

