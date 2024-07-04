const ScheduleModel = require('../models/scheduleModel');
const { connectToDatabase } = require('../db');

const { getDatesBetween } = require('../Utility/dateUtils');


let scheduleModel;

connectToDatabase().then(pool => {
    scheduleModel = new ScheduleModel(pool);
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

exports.createSchedule = async (scheduleData) => {
    try {
        const { FromID, ToID, flightName, validFrom, validTill, distanceKM, activeDay, AircraftID } = scheduleData;

        // Get all dates between validFrom and validTill that fall on the specified activeDay
        const activeDays = getDatesBetween(validFrom, validTill, activeDay);

        // Create an array of new schedule objects for each active day
        const schedules = activeDays.map((scheduleDate) => ({
            date: scheduleDate,
            FromID: FromID,
            ToID: ToID,
            flightName: flightName,
            DistanceKM: distanceKM,
            AircraftID: AircraftID,
            activeDay: activeDay
        }));

        console.log("Creating schedules in controller:", schedules);

        // Create each schedule using the model's createSchedule method
        const insertedIds = await Promise.all(schedules.map(schedule => scheduleModel.createSchedule(schedule)));
        
        return insertedIds;
    } catch (err) {
        console.error('Error in createSchedule function:', err.message);
        throw new Error('Error creating schedule: ' + err.message);
    }
};


exports.getAllSchedules = async (req, res) => {
    try {
        const schedules = await scheduleModel.getAllSchedules();
        
        if (!schedules || schedules.length === 0) {
            return res.status(404).json({ error: 'No schedules found' });
        }
        
        res.json(schedules);
    } catch (err) {
        console.error('Error fetching all schedules:', err);
        
        if (err instanceof TypeError) {
            return res.status(400).json({ error: 'Invalid data received' });
        } else if (err.name === 'DatabaseError') {
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        res.status(500).json({ error: 'Error fetching schedules: ' + err.message });
    }
};

exports.getScheduleById = async (req, res) => {
    const { id } = req.params;
    try {
        const schedule = await scheduleModel.getScheduleById(id);
        if (schedule) {
            res.json(schedule);
        } else {
            res.status(404).json({ error: 'Schedule not found' });
        }
    } catch (err) {
        console.error('Error in getScheduleById function:', err.message);
        res.status(500).json({ error: 'Error fetching schedule: ' + err.message });
    }
};


exports.updateSchedule = async (req, res) => {
    const { id } = req.params;
    const scheduleData = req.body;
    try {
        const updatedSchedule = await scheduleModel.updateSchedule(id, scheduleData);
        res.json(updatedSchedule);
    } catch (err) {
        console.error('Error in updateSchedule function:', err.message);
        res.status(500).json({ error: 'Error updating schedule: ' + err.message });
    }
};

exports.deleteSchedule = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await scheduleModel.deleteSchedule(id);
        if (!result) {
            return res.status(404).json({ error: 'Schedule not found' });
        }
        res.json({ message: 'Schedule deleted successfully' });
    } catch (err) {
        console.error('Error in deleteSchedule function:', err.message);
        res.status(500).json({ error: 'Error deleting schedule: ' + err.message });
    }
};


exports.getRegions = async () => {
    try {
        console.log("Route: GET / - Fetch all regions");

        // Ensure ScheduleModel is initialized
        if (!scheduleModelInstance) {
            throw new Error('ScheduleModel is not initialized');
        }

        // Retrieve regions using ScheduleModel instance
        const regions = await scheduleModelInstance.getRegions();
        return { success: true, regions };
    } catch (err) {
        console.error('Error in getRegions function:', err.message);
        return { success: false, message: 'Error getting regions' };
    }
};

// Function to get schedule by ID
exports.getScheduleById = async (scheduleId) => {
    try {
        // Ensure ScheduleModel is initialized
        if (!scheduleModelInstance) {
            throw new Error('ScheduleModel is not initialized');
        }

        // Retrieve schedule by ID using ScheduleModel instance
        const schedule = await scheduleModelInstance.getScheduleById(scheduleId);
        if (schedule) {
            return { success: true, schedule };
        } else {
            return { success: false, message: `Schedule with ID ${scheduleId} not found` };
        }
    } catch (err) {
        console.error(`Error in getScheduleById function for ID ${scheduleId}:`, err.message);
        return { success: false, message: `Error getting schedule with ID ${scheduleId}` };
    }
};
