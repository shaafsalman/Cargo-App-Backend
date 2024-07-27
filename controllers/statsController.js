const StatsModel = require('../models/statsModel');
const { connectToDatabase } = require('../db');

let statsModel;

connectToDatabase()
    .then(pool => {
        statsModel = new StatsModel(pool);
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

exports.getAdminCard = async () => {
    try {
        // Fetch all the required statistics
        const [totalFlightsResult, upliftResult, allocatedResult, bookedResult] = await Promise.all([
            statsModel.getTotalFlights(), // Method to get total flights
            statsModel.getUplift(),       // Method to get uplift
            statsModel.getAllocated(),    // Method to get allocated
            statsModel.getBooked()        // Method to get booked input weight
        ]);

        // Check for errors in the results
        if (!totalFlightsResult.success) {
            throw new Error(totalFlightsResult.message);
        }
        if (!upliftResult.success) {
            throw new Error(upliftResult.message);
        }
        if (!allocatedResult.success) {
            throw new Error(allocatedResult.message);
        }
        if (!bookedResult.success) {
            throw new Error(bookedResult.message);
        }

        // Combine results into a single response
        return {
            success: true,
            data: {
                totalFlights: totalFlightsResult.data,
                uplift: upliftResult.data,
                allocated: allocatedResult.data,
                booked: bookedResult.data
            }
        };
    } catch (err) {
        console.error('Error fetching admin card data:', err);
        return { success: false, message: 'Database error: ' + err.message };
    }
};

exports.getTopCustomers = async () => {
    try {
        // Fetch the top companies based on chargeable weight
        const topCompaniesResult = await statsModel.getTopCompaniesByChargeableWeight();

        // Check for errors in the results
        if (!topCompaniesResult.success) {
            throw new Error(topCompaniesResult.message);
        }

        // Combine results into a single response
        return {
            success: true,
            data: topCompaniesResult.data
        };
    } catch (err) {
        console.error('Error fetching top customers data:', err);
        return { success: false, message: 'Database error: ' + err.message };
    }
};
exports.getBookingsByRegion = async () => {
    try {
        const result = await statsModel.getBookingsByRegion();
        return result;
    } catch (err) {
        console.error('Error in getBookingsByRegion:', err);
        return { success: false, message: 'Server error: ' + err.message };
    }
};

exports.getUpliftByMonth = async () => {
    try {
        const result = await statsModel.getUpliftByMonth();
        return result;
    } catch (err) {
        console.error('Error in getBookingsByRegion:', err);
        return { success: false, message: 'Server error: ' + err.message };
    }
};


