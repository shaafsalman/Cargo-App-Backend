const express = require('express');
const companyPersonController = require('../controllers/companyPersonController');

const router = express.Router();

// GET all company persons
router.get('/', async (req, res, next) => {
    try {
        console.log("Route: GET / - Fetch all company persons");
        await companyPersonController.getAllCompanyPersons(req, res);
    } catch (err) {
        console.error('Error in companyPersonRoutes:', err.message);
        next(err); 
    }
});
router.get('/:id/company-details', async (req, res, next) => {
    console.log("Route: GET /company details", req.params);
    try {
        console.log("Route: GET / - Fetch company details");
        const id = req.params.id;
        const companyDetails = await companyPersonController.getCompanyDetails(id);
        res.json(companyDetails);
    } catch (err) {
        console.error('Error in companyRoutes:', err.message);
        next(err); 
    }
});
// POST create a new company person
router.post('/add', async (req, res, next) => {
    try {
        console.log("Route: POST /add - Create new company person");
        console.log('Request body:', req.body); 

        const { name, email, password, companyname, status, companyid } = req.body;
        const companyPersonData = { name, email, password,status, companyname, companyid };
        const newCompanyPerson = await companyPersonController.createCompanyPerson(companyPersonData);
        res.status(201).json(newCompanyPerson);
    } catch (err) {
        console.error('Error creating company person:', err.message);
        next(err); 
    }
});


// GET company person by ID
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: GET /${id} - Fetch company person by ID`);
        const companyPerson = await companyPersonController.getCompanyPersonById(id);
        if (!companyPerson) {
            return res.status(404).json({ error: 'Company person not found' });
        }
        res.json(companyPerson);
    } catch (err) {
        console.error(`Error fetching company person with ID ${id}:`, err.message);
        next(err);
    }
});

// PUT update a company person
router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const companyPersonData = req.body;
    console.log(companyPersonData);
    try {
        console.log(`Route: PUT /${id} - Update company person`);
        const updatedCompanyPerson = await companyPersonController.updateCompanyPerson(id, companyPersonData);
        res.json(updatedCompanyPerson);
    } catch (err) {
        console.error(`Error updating company person with ID ${id}:`, err.message);
        next(err);
    }
});

// DELETE a company person
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: DELETE /${id} - Delete company person`);
        const result = await companyPersonController.deleteCompanyPerson(id);
        if (!result) {
            return res.status(404).json({ error: 'Company person not found' });
        }
        res.json({ message: 'Company person deleted successfully' });
    } catch (err) {
        console.error(`Error deleting company person with ID ${id}:`, err.message);
        next(err);
    }
});

// PATCH activate a company person
router.patch('/:id/active', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: PATCH /${id}/activate - Activate company person`);
        const result = await companyPersonController.activateCompanyPerson(id);
        if (!result) {
            return res.status(404).json({ error: 'Company person not found' });
        }
        res.json({ message: 'Company person activated successfully' });
    } catch (err) {
        console.error(`Error activating company person with ID ${id}:`, err.message);
        next(err);
    }
});

// PATCH deactivate a company person
router.patch('/:id/inactive', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: PATCH /${id}/deactivate - Deactivate company person`);
        const result = await companyPersonController.deactivateCompanyPerson(id);
        if (!result) {
            return res.status(404).json({ error: 'Company person not found' });
        }
        res.json({ message: 'Company person deactivated successfully' });
    } catch (err) {
        console.error(`Error deactivating company person with ID ${id}:`, err.message);
        next(err);
    }
});


router.post('/profile', async (req, res, next) => {
    try {
        const {id} = req.body; 
        console.log(`Route: POST /profile - Get all Details for id: ${id}`);

        const details = await companyPersonController.getDetails(id);

        if (Object.keys(details).length > 0) {
            res.status(200).json({
                success: true,
                message: 'All Details retrieved successfully',
                Details: details
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No details were retrieved'
            });
        }
    } catch (err) {
        console.error('Error retrieving details:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});

router.post('/change-password', async (req, res, next) => {
    try {
        const { id, oldPassword, newPassword } = req.body;
        console.log(`Route: POST /change-password - Change Password for id: ${id}`);

        const result = await companyPersonController.changePassword(id, oldPassword, newPassword);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Password changed successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (err) {
        console.error('Error changing password:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});


router.post('/update-customer', async (req, res, next) => {
    try {
        const { id, name, email, companyName } = req.body;
        console.log(`Route: POST /update-customer - Update details for id: ${id}`);

        const result = await companyPersonController.updateCustomerDetails(id, name, email, companyName);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: result.message
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (err) {
        console.error('Error updating customer details:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});



// Error handling middleware - this middleware should be defined last
router.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).json({ error: 'Internal Server Error' }); // Respond with a 500 Internal Server Error
});

module.exports = router;
