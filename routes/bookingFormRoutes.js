const express = require('express');
const bookingFormController = require('../controllers/bookingFormController');

const router = express.Router();

// GET all booking forms
router.get('/', async (req, res, next) => {
    try {
        console.log("Route: GET / - Fetch all booking forms");
        const bookingForms = await bookingFormController.getAllBookingForms();
        res.json(bookingForms);
    } catch (err) {
        console.error('Error in bookingFormRoutes:', err.message);
        next(err); 
    }
});

// Example route handling booking creation
router.post('/add', async (req, res, next) => {
    try {
        const bookingData = req.body;
        console.log("Route: POST /add - Create new booking form");
        console.log('Request body:', req.body);
        // const createdBy = req.user.name; 
        // const createdById = req.user.id; 
        
        // bookingData.createdBy = createdBy;
        // bookingData.createdById = createdById;

        const newBookingForm = await bookingFormController.createBooking(bookingData);
        
        if (newBookingForm) {
            res.status(201).json({
                success: true,
                message: 'Booking form created successfully',
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed to create booking form'
            });
        }
    } catch (err) {
        console.error('Error creating booking form:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});

router.post('/active-bookings', async (req, res, next) => {
    try {
        const { createdById, userEmail } = req.body; 
        console.log(`Route: POST /active-bookings - Get all bookings for id: ${createdById}, email: ${userEmail}`);

        const activeBookings = await bookingFormController.getActiveBooking(createdById, userEmail);

        if (Object.keys(activeBookings).length > 0) {
            res.status(200).json({
                success: true,
                message: 'Active bookings retrieved successfully',
                bookings: activeBookings
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No active bookings found'
            });
        }
    } catch (err) {
        console.error('Error retrieving active bookings:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});


router.post('/all-bookings', async (req, res, next) => {
    try {
        const { createdById, userEmail } = req.body; 
        console.log(`Route: POST /all-bookings - Get all bookings for id: ${createdById}, email: ${userEmail}`);

        const allBookings = await bookingFormController.getAllBooking(createdById, userEmail);

        if (Object.keys(allBookings).length > 0) {
            res.status(200).json({
                success: true,
                message: 'All bookings retrieved successfully',
                bookings: allBookings
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No bookings found'
            });
        }
    } catch (err) {
        console.error('Error retrieving all bookings:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});





// GET booking form by ID
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: GET /${id} - Fetch booking form by ID`);
        const bookingForm = await bookingFormController.getBookingFormById(id);
        if (!bookingForm) {
            return res.status(404).json({ error: 'Booking form not found' });
        }
        res.json(bookingForm);
    } catch (err) {
        console.error(`Error fetching booking form with ID ${id}:`, err.message);
        next(err);
    }
});

// PUT update a booking form
router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const bookingData = req.body;
    try {
        console.log(`Route: PUT /${id} - Update booking form`);
        const updatedBookingForm = await bookingFormController.updateBookingForm(id, bookingData);
        res.json(updatedBookingForm);
    } catch (err) {
        console.error(`Error updating booking form with ID ${id}:`, err.message);
        next(err);
    }
});

// DELETE a booking form
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        console.log(`Route: DELETE /${id} - Delete booking form`);
        const result = await bookingFormController.deleteBookingForm(id);
        if (!result) {
            return res.status(404).json({ error: 'Booking form not found' });
        }
        res.json({ message: 'Booking form deleted successfully' });
    } catch (err) {
        console.error(`Error deleting booking form with ID ${id}:`, err.message);
        next(err);
    }
});

// PATCH activate a booking form
router.patch('/:id/activate', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: PATCH /${id}/activate - Activate booking form`);
        const result = await bookingFormController.activateBookingForm(id);
        if (!result) {
            return res.status(404).json({ error: 'Booking form not found' });
        }
        res.json({ message: 'Booking form activated successfully' });
    } catch (err) {
        console.error(`Error activating booking form with ID ${id}:`, err.message);
        next(err);
    }
});

// PATCH deactivate a booking form
router.patch('/:id/deactivate', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: PATCH /${id}/deactivate - Deactivate booking form`);
        const result = await bookingFormController.deactivateBookingForm(id);
        if (!result) {
            return res.status(404).json({ error: 'Booking form not found' });
        }
        res.json({ message: 'Booking form deactivated successfully' });
    } catch (err) {
        console.error(`Error deactivating booking form with ID ${id}:`, err.message);
        next(err);
    }
});

// Error handling middleware - this middleware should be defined last
router.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).json({ error: 'Internal Server Error' }); // Respond with a 500 Internal Server Error
});

module.exports = router;
