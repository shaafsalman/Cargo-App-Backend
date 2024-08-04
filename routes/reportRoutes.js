const express = require('express');
const reportController = require('../controllers/reportController');

const router = express.Router();

router.get('/booking-report', async (req, res, next) => {
    try {
        console.log('Handling booking report request');
        // console.log(req.query);

        const result = await reportController.getAllBookings(req);

        // Handle response from controller
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (err) {
        console.error('Error handling booking report request:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/customer-report', async (req, res, next) => {
    try {
        console.log('Handling customer report request');

        // Process data or perform validations if needed

        // Call controller method
        const result = await reportController.getAllCustomers(req);

        // Handle response from controller
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (err) {
        console.error('Error handling customer report request:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/flight-manifest', async (req, res, next) => {
    try {
        console.log('Handling flight manifest request');
    
        const result = await reportController.getAllFlightManifests(req);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (err) {
        console.error('Error handling flight manifest request:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/revenue-report', async (req, res, next) => {
    try {
        console.log('Handling revenue-report request');
    
        const result = await reportController.getRevenueReport(req);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (err) {
        console.error('Error handling revenue-report request:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/flight-performance', async (req, res, next) => {
    try {
        console.log('Handling flight performance request');

        // Process data or perform validations if needed

        // Call controller method
        const result = await reportController.getAllFlightPerformances(req);

        // Handle response from controller
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (err) {
        console.error('Error handling flight performance request:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/flights', async (req, res, next) => {
    try {
        console.log('getting flights');
        const result = await reportController.getAllFlights(req,res);
     
    } catch (err) {
        console.error('Error handling flight performance request:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
