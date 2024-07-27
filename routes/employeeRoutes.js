const express = require('express');
const employeeController = require('../controllers/employeeController');

const router = express.Router();

// GET all employees
router.get('/', async (req, res, next) => {
    try {
        console.log("Route: GET / - Fetch all employees");
        await employeeController.getAllEmployees(req, res);
    } catch (err) {
        console.error('Error in employeeRoutes:', err.message);
        next(err);
    }
});

// POST create a new employee
router.post('/add', async (req, res, next) => {
    try {
        console.log("Route: POST /add - Create new employee");
        const { name, email, RegionID, region, password, status } = req.body.newEmployee; 
        // console.log(req.body.newPermissions);
        // Extract newEmployee data
        const  permissions  = req.body.newPermissions; // Extract newPermissions
        // console.log(region);
        // console.log(permissions);
        const employeeData = { name, email, region, RegionID, password, status, permissions };
        const newEmployee = await employeeController.createEmployee(employeeData);
        
        res.status(201).json(newEmployee);
    } catch (err) {
        console.error('Error creaating employee:', err.message);
        res.status(400).json({ error: err.message });
        next(err);
    }
});


// GET employee by ID
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: GET /${id} - Fetch employee by ID`);
        const employee = await employeeController.getEmployeeById(id);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json(employee);
    } catch (err) {
        console.error(`Error fetching employee with ID ${id}:`, err.message);
        next(err);
    }
});

// PUT update an employee
router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    console.log(req.body);
    try {
        const { name, email, RegionID, region, password, status } = req.body.selectedEmployee; 
        // console.log(req.body.newPermissions);
        // Extract newEmployee data
        const  permissions  = req.body.newPermissions;
        // console.log(region);
        console.log(permissions);
        const employeeData = { name, email, region, RegionID, password, status, permissions };
        const updateEmployee = await employeeController.updateEmployee(id,employeeData);
        res.json(updateEmployee);
    } catch (err) {
        console.error(`Error updating employee with ID ${id}:`, err.message);
        res.status(400).json({ error: err.message });
        next(err);
    }
});

// DELETE an employee
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        console.log(`Route: DELETE /${id} - Delete employee`);
        const result = await employeeController.deleteEmployee(id);
        if (!result) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        console.error(`Error deleting employee with ID ${id}:`, err.message);
        next(err);
    }
});

// PATCH activate an employee
router.patch('/:id/active', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: PATCH /${id}/activate - Activate employee`);
        const result = await employeeController.activateEmployee(id);
        if (!result) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json({ message: 'Employee activated successfully' });
    } catch (err) {
        console.error(`Error activating employee with ID ${id}:`, err.message);
        next(err);
    }
});

// PATCH deactivate an employee
router.patch('/:id/inactive', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: PATCH /${id}/deactivate - Deactivate employee`);
        const result = await employeeController.deactivateEmployee(id);
        if (!result) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json({ message: 'Employee deactivated successfully' });
    } catch (err) {
        console.error(`Error deactivating employee with ID ${id}:`, err.message);
        next(err);
    }
});

// Error handling middleware - this middleware should be defined last
router.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).json({ error: 'Internal Server Error' }); // Respond with a 500 Internal Server Error
});

module.exports = router;