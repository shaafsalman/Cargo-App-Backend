const express = require('express');
const regionController = require('../controllers/regionController2');

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

// // GET region by ID
// router.get('/:id', async (req, res, next) => {
//     const { id } = req.params;
//     try {
//         console.log(`Route: GET /${id} - Fetch region by ID`);
//         const region = await regionController.getRegionById(id);
//         if (!region) {
//             return res.status(404).json({ error: 'Region not found' });
//         }
//         res.json(region);
//     } catch (err) {
//         console.error(`Error fetching region with ID ${id}:`, err.message);
//         next(err);
//     }
// });

// Error handling middleware - this middleware should be defined last
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = router;

