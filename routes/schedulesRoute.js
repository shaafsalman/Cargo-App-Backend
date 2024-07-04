const express = require('express');
const scheduleController = require('../controllers/scheduleController');

const router = express.Router();

// GET all schedules
router.get('/', async (req, res, next) => {
    try {
        console.log("Route: GET / - Fetch all schedules");
        await scheduleController.getAllSchedules(req, res);
    } catch (err) {
        console.error('Error in schedulesRoute:', err.message);
        next(err); 
    }
});

// POST create a new schedule
router.post('/add', async (req, res, next) => {
    try {
        console.log("Route: POST /add - Create new schedule");
        // console.log(req.body);
        const {  FromID, ToID, flightName,validFrom,validTill, distanceKM, activeDay, AircraftID } = req.body;
        const scheduleData = {  FromID, ToID, flightName,validFrom,validTill, distanceKM, activeDay, AircraftID };
        console.log('Schedule Data:', scheduleData);
        const newSchedule = await scheduleController.createSchedule(scheduleData);
        res.status(201).json(newSchedule);
    } catch (err) {
        console.error('Error creating schedule:', err.message);
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


// Error handling middleware - this middleware should be defined last
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = router;
