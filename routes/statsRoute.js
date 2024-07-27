const express = require('express');
const statsController = require('../controllers/statsController');

const router = express.Router();

// GET all schedules
router.get('/admin-cards', async (req, res, next) => {
    try {
        const result = await statsController.getAdminCard();
        res.json(result);
    } catch (err) {
        next(err); // Pass errors to the error handling middleware
    }
});

router.get('/bookings-by-region', async (req, res) => {
    const result = await statsController.getBookingsByRegion();
    if (result.success) {
        res.status(200).json({ success: true, data: result.data });
    } else {
        res.status(500).json({ success: false, message: result.message });
    }
});
router.get('/uplift-by-month', async (req, res) => {
    const result = await statsController.getUpliftByMonth();
    if (result.success) {
        res.status(200).json({ success: true, data: result.data });
    } else {
        res.status(500).json({ success: false, message: result.message });
    }
});

router.get('/top-customers', async (req, res, next) => {
    try {
        const result = await statsController.getTopCustomers();
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(500).json({ error: result.message });
        }
    } catch (err) {
        console.error('Error in /top-customers route:', err.message);
        next(err);
    }
});

// Error handling middleware - this middleware should be defined last
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = router;
