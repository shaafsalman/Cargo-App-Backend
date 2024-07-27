const ScheduleModel = require('../models/scheduleModel');
const { connectToDatabase } = require('../db');
const moment = require('moment');
const { formatTime } = require('../Utility/dateUtils');
const { getDatesBetween } = require('../Utility/dateUtils');


let scheduleModel;

connectToDatabase().then(pool => {
    scheduleModel = new ScheduleModel(pool);
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});


exports.createSchedule = async (scheduleData) => {
    try {
        const { from, to, flightName,connectionid, validFrom, validTill, AircraftID,activeDays, arrTimeHour, arrTimeMinute, depTimeHour, depTimeMinute} = scheduleData;

        // Get all dates between validFrom and validTill that fall on the specified activeDays
        const activeDys = getDatesBetween(validFrom, validTill, activeDays);
        const formattedArrTime = arrTimeHour+":"+ arrTimeMinute;
        // Format departure time to 'HH:mm:ss'
        const formattedDepTime = depTimeHour+":"+depTimeMinute;
        console.log(activeDys);
        // Create an array of new schedule objects for each active day
        const schedules = activeDys.map((scheduleDate) => {
            const formattedSchedule = {
              connectionid,
              flightName,
              validFrom,
              validTill,
              AircraftID,
              formattedArrTime,
              formattedDepTime,
              date: moment(scheduleDate).format('YYYY-MM-DD'),
              activeDay: moment(scheduleDate).format('dddd'),
            };
          
            return formattedSchedule;
          });

        // console.log("Creating schedules in controller:", schedules);

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


exports.updateSchedule = async (scheduleId, newData) => {
    try {
        // Destructure the newData object to get the updated fields
        const { connectionid,arrTimeHour, arrTimeMinute, depTimeHour, depTimeMinute,AircraftID,flightName,date } = newData;

        // Validate required fields
        // if (!name || !email || !status) {
        //     throw new Error('Name, email, and status are required fields.');
        // }

        // Check if adminId is valid (optional step depending on your model)
        // Example validation:
        const formattedArrTime = arrTimeHour+":"+ arrTimeMinute;
        // Format departure time to 'HH:mm:ss'
        const formattedDepTime = depTimeHour+":"+depTimeMinute;
        const existingSchedule = await scheduleModel.getScheduleById(scheduleId);
        if (!existingSchedule) {
            throw new Error(`Schedule with ID ${scheduleId} not found.`);
        }

        // Update only the fields that are provided in newData
        const updatedScheduleData = {
            connectionid,formattedArrTime,formattedDepTime,AircraftID,flightName,date,
            updated_at: new Date() // Update the updated_at timestamp
        };

        // Call the model function to update admin details
        const result = await scheduleModel.updateSchedule(scheduleId, updatedScheduleData);

        return result; // Return the result of the update operation (true/false or any relevant data)
    } catch (err) {
        console.error('Error in updateSchedule function:', err.message);
        throw err; // Throw the error to be caught by the calling function or middleware
    }
};

exports.deleteSchedule = async (scheduleId) => {
    try {
        const result = await scheduleModel.deleteSchedule(scheduleId);
        return result;
    } catch (err) {
        console.error(`Error in deleteSchedule controller: ${err.message}`);
        throw err;
    }
};


exports.getSchedulesByFromTo = async (req) => {
    // console.log(req.body);
    const { routeID } = req.query;
    try {
        const schedules = await scheduleModel.getSchedulesByFromTo(routeID);
        // console.log("schedules controller: " ,schedules);
        if (schedules.length > 0) {
            return { success: true, schedules };
        } else {
            return { success: false, message: `Schedules with FromID ${fromId}, ToID ${toId}, and Date ${date} not found` };
        }
    } catch (err) {
        console.error(`Error in getSchedulesByFromTo controller: ${err.message}`);
        throw err;
    }
};
exports.getSchedulesByFrom = async (req) => {
    // console.log(req.body);
    const { fromId } = req.query;
    try {
        const schedules = await scheduleModel.getSchedulesByFrom(fromId);
        // console.log("schedules controller: " ,schedules);
        if (schedules.length > 0) {
            return { success: true, schedules };
        } else {
            return { success: false, message: `Schedules with FromID ${fromId} not found` };
        }
    } catch (err) {
        console.error(`Error in getSchedulesByFrom controller: ${err.message}`);
        throw err;
    }
};

exports.getSchedulesByTo = async (req) => {
    // console.log(req.body);
    const { toId } = req.query;
    try {
        const schedules = await scheduleModel.getSchedulesByTo( toId);
        // console.log("schedules controller: " ,schedules);
        if (schedules.length > 0) {
            return { success: true, schedules };
        } else {
            return { success: false, message: `Schedules with  ToID ${toId} not found` };
        }
    } catch (err) {
        console.error(`Error in getSchedulesByTo controller: ${err.message}`);
        throw err;
    }
};



exports.getRegions = async () => {
    try {

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
