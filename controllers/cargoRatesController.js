const CargoRatesModel = require('../models/cargoRatesModel');
const { connectToDatabase } = require('../db');

let cargoRatesModel;

connectToDatabase().then(pool => {
    cargoRatesModel = new CargoRatesModel(pool);
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

exports.getAllCargoRates = async () => {
    try {
        const cargoRates = await cargoRatesModel.getAllCargoRates();
        if (!cargoRates || cargoRates.length === 0) {
            return { success: false, message: 'No cargo rates found' };
        }
        return { success: true, data: cargoRates };
    } catch (err) {
        console.error('Error fetching all cargo rates:', err);
        return { success: false, message: 'Error fetching cargo rates: ' + err.message };
    }
};

exports.createCargoRate = async (cargoRateData) => {
    try {
        const { code, scheduleID, currency, rate, otherAmount, validFrom, validTill, applyTo, category } = cargoRateData;

        console.log('Received cargo rate data:', cargoRateData); // Print received data

        if (!code || !scheduleID || !currency || !rate || !validFrom || !validTill || !applyTo) {
            return { success: false, message: 'Missing required fields' };
        }

        console.log("routing controller");
        const newCargoRateData = {
            code,
            scheduleID,
            currency,
            rate,
            otherAmount,
            validFrom,
            validTill,
            applyTo,
            category,
            created_at: new Date(),
            updated_at: new Date(),
        };

        const result = await cargoRatesModel.createCargoRate(newCargoRateData);
        if (result) {
            return { success: true, message: 'Cargo rate created successfully', data: result };
        }
        return { success: false, message: 'Failed to create cargo rate' };
    } catch (err) {
        console.error('Error in createCargoRate function:', err.message);
        return { success: false, message: 'Error creating cargo rate: ' + err.message };
    }
};

exports.getCargoRates = async (companyPersonID, fromID, toID) => {
    try {
        const result = await cargoRatesModel.getCargoRatesForCompanyPerson(companyPersonID, fromID, toID);
        if (result) {
            return { success: true, message: 'Cargo rates fetched successfully', data: result };
        }
        return { success: false, message: 'No cargo rates found' };
    } catch (err) {
        console.error('Error in getCargoRates function:', err.message);
        return { success: false, message: 'Error fetching cargo rates: ' + err.message };
    }
};


exports.applyCargoRateToCompanies = async (cargoRateID, companyIDs) => {
    try {
        console.log("In controller function", cargoRateID, companyIDs);
        
        const result = await cargoRatesModel.applyCargoRateToCompanies(cargoRateID, companyIDs);
        
        return { success: true, message: 'Cargo rate applied to companies successfully', data: result };
    } catch (err) {
        console.error('Error in cargoRatesController.applyCargoRateToCompanies:', err.message);
        throw new Error('Error applying cargo rate to companies: ' + err.message);
    }
};

exports.getCargoRateById = async (id) => {
    try {
        const cargoRate = await cargoRatesModel.getCargoRateById(id);
        if (cargoRate) {
            return { success: true, data: cargoRate };
        }
        return { success: false, message: 'Cargo rate not found' };
    } catch (err) {
        console.error('Error fetching cargo rate by ID:', err.message);
        return { success: false, message: 'Error fetching cargo rate: ' + err.message };
    }
};

exports.updateCargoRate = async (id, cargoRateData) => {
    try {
        const updatedCargoRate = await cargoRatesModel.updateCargoRate(id, cargoRateData);
        if (updatedCargoRate) {
            return { success: true, message: 'Cargo rate updated successfully', data: updatedCargoRate };
        }
        return { success: false, message: 'Failed to update cargo rate' };
    } catch (err) {
        console.error('Error updating cargo rate:', err.message);
        return { success: false, message: 'Error updating cargo rate: ' + err.message };
    }
};

exports.deleteCargoRate = async (id) => {
    try {
        const result = await cargoRatesModel.deleteCargoRate(id);
        if (result) {
            return { success: true, message: 'Cargo rate deleted successfully' };
        }
        return { success: false, message: 'Cargo rate not found' };
    } catch (err) {
        console.error('Error deleting cargo rate:', err.message);
        return { success: false, message: 'Error deleting cargo rate: ' + err.message };
    }
};

exports.activateCargoRate = async (id) => {
    try {
        const result = await cargoRatesModel.activateCargoRate(id);
        if (result) {
            return { success: true, message: 'Cargo rate activated successfully', data: result };
        }
        return { success: false, message: 'Cargo rate not found' };
    } catch (err) {
        console.error('Error activating cargo rate:', err.message);
        return { success: false, message: 'Error activating cargo rate: ' + err.message };
    }
};

exports.deactivateCargoRate = async (id) => {
    try {
        const result = await cargoRatesModel.deactivateCargoRate(id);
        if (result) {
            return { success: true, message: 'Cargo rate deactivated successfully', data: result };
        }
        return { success: false, message: 'Cargo rate not found' };
    } catch (err) {
        console.error('Error deactivating cargo rate:', err.message);
        return { success: false, message: 'Error deactivating cargo rate: ' + err.message };
    }
};
