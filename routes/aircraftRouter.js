const express = require('express');
const aircraftController = require('../controllers/aircraftController'); 

const router = express.Router();

// GET all aircrafts
router.get('/', async (req, res, next) => {
    try {
        console.log("Route: GET / - Fetch all aircrafts");
        const result = await aircraftController.getAllAircrafts();
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(404).json({ error: result.message });
        }
    } catch (err) {
        console.error('Error in aircraftRouter:', err.message);
        next(err);
    }
});

// POST create a new aircraft
router.post('/add', async (req, res, next) => {
    try {
        console.log("Route: POST /add - Create new aircraft");
        const aircraftData = req.body;
        const result = await aircraftController.createAircraft(aircraftData);
        if (result.success) {
            res.status(201).json({ message: result.message, data: result.data });
        } else {
            res.status(400).json({ error: result.message });
        }
    } catch (err) {
        console.error('Error creating aircraft:', err.message);
        next(err);
    }
});

// GET aircraft by ID
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: GET /${id} - Fetch aircraft by ID`);
        const result = await aircraftController.getAircraftById(id);
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(404).json({ error: result.message });
        }
    } catch (err) {
        console.error(`Error fetching aircraft with ID ${id}:`, err.message);
        next(err);
    }
});

// PUT update an aircraft
router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const aircraftData = req.body;
    try {
        console.log(`Route: PUT /${id} - Update aircraft`);
        const result = await aircraftController.updateAircraft(id, aircraftData);
        if (result.success) {
            res.json({ message: result.message, data: result.data });
        } else {
            res.status(400).json({ error: result.message });
        }
    } catch (err) {
        console.error(`Error updating aircraft with ID ${id}:`, err.message);
        next(err);
    }
});

// DELETE an aircraft
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: DELETE /${id} - Delete aircraft`);
        const result = await aircraftController.deleteAircraft(id);
        if (result.success) {
            res.json({ message: result.message });
        } else {
            res.status(404).json({ error: result.message });
        }
    } catch (err) {
        console.error(`Error deleting aircraft with ID ${id}:`, err.message);
        next(err);
    }
});

// Error handling middleware - this middleware should be defined last
router.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).json({ error: 'Internal Server Error' }); // Respond with a 500 Internal Server Error
});

module.exports = router;