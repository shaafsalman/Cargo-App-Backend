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


router.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).json({ error: 'Internal Server Error' }); // Respond with a 500 Internal Server Error
});

module.exports = router;