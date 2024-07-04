const express = require('express');
const aircraftController = require('../controllers/aircraftController');
const AircraftModel = require('../models/aircraftModel');

const router = express.Router();

// Create an instance of AircraftModel with your database connection (db)
const db = require('../db'); // Import your database connection configuration
const aircraftModel = new AircraftModel(db);

// GET all aircraft
router.get('/', async (req, res, next) => {
    try {
        await aircraftController.getAllAircraft(req, res);
    } catch (err) {
        console.error('Error in aircraftRoutes:', err.message);
        next(err); 
    }
});

// GET aircraft by ID
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const aircraft = await aircraftController.getAircraftById(id);
        if (!aircraft) {
            return res.status(404).json({ error: 'Aircraft not found' });
        }
        res.json(aircraft);
    } catch (err) {
        console.error(`Error fetching aircraft with ID ${id}:`, err.message);
        next(err);
    }
});

// POST create a new aircraft
router.post('/add', async (req, res, next) => {
    console.log("hello");
    try {
        const { type, registration, capacity, operator, marketingby } = req.body;
        const newAircraft = await aircraftModel.createAircraft({
            type,
            registration,
            capacity,
            operator,
            marketingby
        });
        res.status(201).json(newAircraft);
    } catch (err) {
        console.error('Error creating aircraft:', err.message);
        next(err); 
    }
});

// PUT update an aircraft
router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const aircraftData = req.body;
    try {
        const updatedAircraft = await aircraftController.updateAircraft(id, aircraftData);
        res.json(updatedAircraft);
    } catch (err) {
        console.error(`Error updating aircraft with ID ${id}:`, err.message);
        next(err);
    }
});

// DELETE an aircraft
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await aircraftController.deleteAircraft(id);
        if (!result) {
            return res.status(404).json({ error: 'Aircraft not found' });
        }
        res.json({ message: 'Aircraft deleted successfully' });
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
