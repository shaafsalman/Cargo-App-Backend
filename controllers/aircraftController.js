const AircraftModel = require('../models/aircraftModel');
const { connectToDatabase } = require('../db');

let aircraftModel;

connectToDatabase().then(pool => {
    aircraftModel = new AircraftModel(pool);
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

exports.getAllAircrafts = async () => {
    try {
        const aircrafts = await aircraftModel.getAllAircrafts();
        return { success: true, data: aircrafts };
    } catch (err) {
        console.error('Error fetching all aircrafts:', err);
        return { success: false, message: 'Database error: ' + err.message };
    }
};

exports.createAircraft = async (data) => {
    try {
        const result = await aircraftModel.createAircraft(data);
        return { success: true, message: result.message };
    } catch (err) {
        console.error('Error creating aircraft:', err);
        return { success: false, message: 'Database error: ' + err.message };
    }
};

exports.getAircraftById = async (id) => {
    try {
        const aircraft = await aircraftModel.getAircraftById(id);
        return { success: true, data: aircraft };
    } catch (err) {
        console.error('Error fetching aircraft by ID:', err);
        return { success: false, message: 'Database error: ' + err.message };
    }
};

exports.updateAircraft = async (id, data) => {
    try {
        const result = await aircraftModel.updateAircraft(id, data);
        return { success: true, message: result.message };
    } catch (err) {
        console.error('Error updating aircraft:', err);
        return { success: false, message: 'Database error: ' + err.message };
    }
};

exports.deleteAircraft = async (id) => {
    try {
        const result = await aircraftModel.deleteAircraft(id);
        return { success: true, message: result.message };
    } catch (err) {
        console.error('Error deleting aircraft:', err);
        return { success: false, message: 'Database error: ' + err.message };
    }
};
