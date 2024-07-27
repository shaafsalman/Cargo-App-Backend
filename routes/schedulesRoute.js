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
        console.log(req.body);
        const {  from, to, flightName,validFrom,validTill, AircraftID,activeDays, arrTimeHour, arrTimeMinute, depTimeHour, depTimeMinute, connectionid } = req.body;
        const scheduleData = {  from, to, flightName,validFrom,validTill, AircraftID,activeDays,arrTimeHour, arrTimeMinute, depTimeHour, depTimeMinute, connectionid};
        console.log('Schedule Data:', scheduleData);
        const newSchedule = await scheduleController.createSchedule(scheduleData);
        res.status(201).json(newSchedule);
    } catch (err) {
        console.error('Error creating schedule:', err.message);
        next(err); 
    }
});

// Example route to get schedules by fromId and toId
router.get('/get-from-to', async (req, res) => {
    // console.log("request",req.query);

    try {
        const result = await scheduleController.getSchedulesByFromTo(req);
        
        if (result.success) 
        {
            res.status(200).json(result.schedules);
        } 
        else 
        {
            res.status(404).json({ error: result.message });
        }
    } catch (error) {
        console.error('Error in GET /schedules:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/get-from', async (req, res) => {
    // console.log("request",req.query);

    try {
        const result = await scheduleController.getSchedulesByFrom(req);
        
        if (result.success) 
        {
            res.status(200).json(result.schedules);
        } 
        else 
        {
            res.status(404).json({ error: result.message });
        }
    } catch (error) {
        console.error('Error in GET /schedules:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



router.get('/get-to', async (req, res) => {
    // console.log("request",req.query);

    try {
        const result = await scheduleController.getSchedulesByTo(req);
        
        if (result.success) 
        {
            res.status(200).json(result.schedules);
        } 
        else 
        {
            res.status(404).json({ error: result.message });
        }
    } catch (error) {
        console.error('Error in GET /schedules:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
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

// Error handling middleware - this middleware should be defined last
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = router;
