const express = require('express');
const employeePermissionController = require('../controllers/employeePermissionController');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        console.log("Route: GET / - Fetch all employees");
        await employeePermissionController.getAllEmployees(req, res);
    } catch (err) {
        console.error('Error in employeeRoutes:', err.message);
        next(err);
    }
});
// GET all employees
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log(`Route: GET /${id} - Fetch employee with ID ${id}`);

        const employee = await employeePermissionController.getEmployeeById(id);
        if (!employee) {
            // If no employee is found, send a 404 response
            res.status(404).json({ message: 'Employee not found' });
            return;
        }

        // Send the employee data in the response
        res.status(200).json(employee);
    } catch (err) {
        console.error('Error in employeeRoutes:', err.message);
        next(err); // Pass the error to the next middleware (usually an error handler)
    }
});

// Error handling middleware - this middleware should be defined last
router.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).json({ error: 'Internal Server Error' }); // Respond with a 500 Internal Server Error
});

module.exports = router;
