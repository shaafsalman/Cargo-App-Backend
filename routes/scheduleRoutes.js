const express = require('express');
const scheduleController = require('../controllers/scheduleController');

const router = express.Router();

// GET all schedules
router.get('/', async (req, res, next) => {
    try {
        console.log("Route: GET / - Fetch all regions");
        const schedules = await scheduleController.getAllSchedules();
        console.log(schedules);
        res.json(schedules);
    } catch (err) {
        console.error('Error in scheduleRoutes:', err.message);
        next(err);
    }
});


// GET all regions
router.get('/regions', async (req, res, next) => {
    try {
        console.log("Route: GET / - Fetch all regions");
        const regions = await scheduleController.getRegions();;
        res.json(regions);
    } catch (err) {
        console.error('Error in scheduleRoutes:', err.message);
        next(err);
    }
});

// GET schedule by ID
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: GET /${id} - Fetch schedule by ID`);
        const schedule = await scheduleController.getScheduleById(id);
        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
        res.json(schedule);
    } catch (err) {
        console.error(`Error fetching schedule with ID ${id}:`, err.message);
        next(err);
    }
});

// POST create a new schedule
router.post('/add', async (req, res, next) => {
    try {
        const scheduleData = req.body;
        console.log(req.body);
        console.log("Route: POST /add - Create new schedule");
        console.log(scheduleData);
        const newSchedule = await scheduleController.createSchedule(scheduleData);
        if (newSchedule) {
            res.status(201).json
            ({
                success: true,
                message: 'Schedule created successfully',
                schedule: newSchedule
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed to create schedule'
            });
        }
    } catch (err) {
        console.error('Error creating schedule:', err.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
        next(err);
    }
});

// PUT update a schedule
router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const scheduleData = req.body;
    try {
        console.log(`Route: PUT /${id} - Update schedule`);
        const updatedSchedule = await scheduleController.updateSchedule(id, scheduleData);
        res.json(updatedSchedule);
    } catch (err) {
        console.error(`Error updating schedule with ID ${id}:`, err.message);
        next(err);
    }
});

// DELETE a schedule
router.delete('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        console.log(`Route: DELETE /${id} - Delete schedule`);
        const result = await scheduleController.deleteSchedule(id);
        if (!result) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
        res.json({ message: 'Schedule deleted successfully' });
    } catch (err) {
        console.error(`Error deleting schedule with ID ${id}:`, err.message);
        next(err);
    }
});

// Error handling middleware - this middleware should be defined last
router.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).json({ error: 'Internal Server Error' }); // Respond with a 500 Internal Server Error
});

module.exports = router;
