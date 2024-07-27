const express = require('express');
const employeePermissionController = require('../controllers/employeePermissionController');

const router = express.Router();

// GET all employees
router.get('/', async (req, res, next) => {
    try {
        console.log("Route: GET / - Fetch all employees");
        await employeePermissionController.getAllEmployees(req, res);
    } catch (err) {
        console.error('Error in employeeRoutes:', err.message);
        next(err);
    }
});

// Error handling middleware - this middleware should be defined last
router.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).json({ error: 'Internal Server Error' }); // Respond with a 500 Internal Server Error
});

module.exports = router;
