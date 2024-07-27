const express = require('express');
const cargoRatesController = require('../controllers/cargoRatesController'); // Adjust the path as necessary

const router = express.Router();

// GET all cargo rates
router.get('/', async (req, res, next) => {
    try {
        console.log("Route: GET / - Fetch all cargo rates");
        const result = await cargoRatesController.getAllCargoRates();
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(404).json({ error: result.message });
        }
    } catch (err) {
        console.error('Error in cargoRatesRouter:', err.message);
        next(err);
    }
});

// POST create a new cargo rate
router.post('/add', async (req, res, next) => {
    try {
        console.log("Route: POST /add - Create new cargo rate");
        console.log(req.body);
        const { code, scheduleID, currency, rate, validFrom, validTill, connectionid, applyTo, category } = req.body;
        const cargoRateData = { code, scheduleID, connectionid, currency, rate, validFrom, validTill, applyTo, category };
        const result = await cargoRatesController.createCargoRate(cargoRateData);
        if (result.success) {
            res.status(201).json({ message: result.message, data: result.data });
        } else {
            res.status(400).json({ error: result.message });
        }
    } catch (err) {
        console.error('Error creating cargo rate:', err.message);
        next(err);
    }
});

router.post('/:cargoRateID/companies', async (req, res, next) => {
    const { cargoRateID } = req.params;
    const { companyIDs } = req.body; 

    try {
        console.log(`Route: POST /${cargoRateID}/companies - Apply cargo rate to companies`);
        console.log(req.params);
        console.log(req.body);
        
        const result = await cargoRatesController.applyCargoRateToCompanies(cargoRateID, companyIDs);
        
        if (result.success) {
            res.status(201).json({ message: result.message, data: result.data });
        } else {
            res.status(400).json({ error: result.message });
        }
    } catch (err) {
        console.error(`Error applying cargo rate to companies for cargo rate ID ${cargoRateID}:`, err.message);
        next(err);
    }
});


router.get('/get-rates/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: GET /get-rates-company-person/${id} - Fetch cargo rates for company person`);
        const result = await cargoRatesController.getCargoRates(id, req.query.connectionid);
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(404).json({ error: result.message });
        }
    } catch (err) {
        console.error(`Error fetching cargo rates for company person with ID ${id}:`, err.message);
        next(err);
    }
});

// GET cargo rate by ID
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: GET /${id} - Fetch cargo rate by ID`);
        const result = await cargoRatesController.getCargoRateById(id);
        if (result.success) {
            res.json(result.data);
        } else {
            res.status(404).json({ error: result.message });
        }
    } catch (err) {
        console.error(`Error fetching cargo rate with ID ${id}:`, err.message);
        next(err);
    }
});

// PUT update a cargo rate
router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const cargoRateData = req.body;

    console.log("router: ",cargoRateData);
    try {
        console.log(`Route: PUT /${id} - Update cargo rate`);
        const result = await cargoRatesController.updateCargoRate(id, cargoRateData);
        if (result.success) {
            console.log("done");
            res.status(201).json({ message: result.message, data: result.data });
        } else {
            res.status(400).json({ error: result.message });
        }
    } catch (err) {
        console.error(`Error updating cargo rate with ID ${id}:`, err.message);
        next(err);
    }
});

// DELETE a cargo rate
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: DELETE /${id} - Delete cargo rate`);
        const result = await cargoRatesController.deleteCargoRate(id);
        if (result.success) {
            res.json({ message: result.message });
        } else {
            res.status(404).json({ error: result.message });
        }
    } catch (err) {
        console.error(`Error deleting cargo rate with ID ${id}:`, err.message);
        next(err);
    }
});


// Error handling middleware - this middleware should be defined last
router.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).json({ error: 'Internal Server Error' }); // Respond with a 500 Internal Server Error
});

module.exports = router;
