const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

// GET all admins
router.get('/', async (req, res, next) => {
    try {
        console.log("Route: GET / - Fetch all admins");
        await adminController.getAllAdmins(req, res);
    } catch (err) {
        console.error('Error in adminRoutes:', err.message);
        next(err); 
    }
});

// POST create a new admin
router.post('/add', async (req, res, next) => {
    try {
        console.log("Route: POST /add - Create new admin");
        console.log('Request body:', req.body); 

        const { name, email, password, status } = req.body;
        const adminData = { name, email, password,status };
        const newAdmin = await adminController.createAdmin(adminData);
        res.status(201).json(newAdmin);
    } catch (err) {
        console.error('Error creating admin:', err.message);
        next(err); 
    }
});

// GET admin by ID
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: GET /${id} - Fetch admin by ID`);
        const admin = await adminController.getAdminById(id);
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        res.json(admin);
    } catch (err) {
        console.error(`Error fetching admin with ID ${id}:`, err.message);
        next(err);
    }
});

// PUT update an admin
router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const adminData = req.body;
    try {
        console.log(`Route: PUT /${id} - Update admin`);
        const updatedAdmin = await adminController.updateAdmin(id, adminData);
        res.json(updatedAdmin);
    } catch (err) {
        console.error(`Error updating admin with ID ${id}:`, err.message);
        next(err);
    }
});

// DELETE an admin
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    console.log(`Route: DELETE /${id} - Delete admin`);
    const result = await adminController.deleteAdmin(id);
    if (!result) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    console.error(`Error deleting admin with ID ${id}:`, err.message);
    next(err);
  }
});


// PATCH activate an admin
router.patch('/:id/active', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: PATCH /${id}/activate - Activate admin`);
        const result = await adminController.activateAdmin(id);
        if (!result) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        res.json({ message: 'Admin activated successfully' });
    } catch (err) {
        console.error(`Error activating admin with ID ${id}:`, err.message);
        next(err);
    }
});

// PATCH deactivate an admin
router.patch('/:id/inactive', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: PATCH /${id}/deactivate - Deactivate admin`);
        const result = await adminController.deactivateAdmin(id);
        if (!result) {
            return res.status(404).json({ error: 'Admin not found' });
        }
        res.json({ message: 'Admin deactivated successfully' });
    } catch (err) {
        console.error(`Error deactivating admin with ID ${id}:`, err.message);
        next(err);
    }
});


router.post('/profile', async (req, res, next) => {
    try {
        const {id} = req.body; 
        console.log(`Route: POST admin/profile - Get all Details for id: ${id}`);

        const details = await adminController.getDetails(id);

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

        const result = await adminController.changePassword(id, oldPassword, newPassword);

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

        const result = await adminController.updateCustomerDetails(id, name, email, companyName);

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
