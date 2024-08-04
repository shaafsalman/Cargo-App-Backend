const ReportModel = require('../models/reportModel');
const { connectToDatabase } = require('../db');

let reportModel;

// Connect to the database and initialize reportModel
connectToDatabase().then(pool => {
    reportModel = new ReportModel(pool);
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

// Function to get all bookings
exports.getAllBookings = async (req, res) => {
    // console.log('Get all bookings');
    const { customerID, bookingDateFrom, bookingDateTo, routeID, status, flight } = req.query;
    try {
        const bookings = await reportModel.getAllBookings(customerID, bookingDateFrom, bookingDateTo, routeID, status, flight);
        if (bookings.length > 0) {
            return {
                success: true,
                message: 'Bookings retrieved successfully',
                data: bookings
            };
        } else {
            return {
                success: false,
                message: 'No bookings found'
            };
        }
    } catch (err) {
        console.error('Error in getAllBookings:', err.message);
        return {
            error: 'Internal Server Error'
        };
    }
};

// Function to get all customers
exports.getAllCustomers = async (req, res) => {
    const { customerID, bookingDateFrom, bookingDateTo,status } = req.query;

    try {
        const customers = await reportModel.getAllCustomers(customerID, bookingDateFrom, bookingDateTo,status);
        // console.log("controllers",customers);
        if (customers.length > 0) {
            return {
                success: true,
                message: 'Customers retrieved successfully',
                data: customers
            };
        } else {
            return {
                success: false,
                message: 'No customers found'
            };
        }
    } catch (err) {
        console.error('Error in getAllCustomers:', err.message);
        return {
            error: 'Internal Server Error'
        };
    }
};

// Function to get all flight manifests
exports.getAllFlightManifests = async (req, res) => {
    const { AircraftID, connectionID, Date, flightNO} = req.query;
    // console.log('Query parameters:',AircraftID, connectionID, Date, flightNO);
    try {
        const manifests = await reportModel.getAllFlightManifests(AircraftID, connectionID, Date, flightNO);
        // console.log("controller",manifests);
        if (manifests.length > 0) {
            return {
                success: true,
                message: 'Flight manifests retrieved successfully',
                data: manifests
            };
        } else {
            return {
                success: false,
                message: 'No flight manifests found'
            };
        }
    } catch (err) {
        console.error('Error in getAllFlightManifests:', err.message);
        return {
            error: 'Internal Server Error'
        };
    }
};


exports.getRevenueReport = async (req, res) => {
    const { AircraftID, connectionID, bookingDateFrom, bookingDateTo, flightNO} = req.query;
    try {
        const manifests = await reportModel.getRevenueReport(AircraftID, connectionID, bookingDateFrom, bookingDateTo, flightNO);
        // console.log("controller",manifests);
        if (manifests.length > 0) {
            return {
                success: true,
                message: 'Flight manifests retrieved successfully',
                data: manifests
            };
        } else {
            return {
                success: false,
                message: 'No flight manifests found'
            };
        }
    } catch (err) {
        console.error('Error in getAllFlightManifests:', err.message);
        return {
            error: 'Internal Server Error'
        };
    }
};


// Function to get all flight performances
exports.getAllFlightPerformances = async (req, res) => {
    const { flightNO, bookingDateFrom, bookingDateTo, connectionID , AircraftID } = req.query;
    // console.log('Query parameters:',  flightNO, bookingDateFrom, bookingDateTo, connectionID , AircraftID );
    try {
        const performances = await reportModel.getAllFlightPerformances( flightNO, bookingDateFrom, bookingDateTo, connectionID , AircraftID );
        if (performances.length > 0) {
            return {
                success: true,
                message: 'Flight performances retrieved successfully',
                data: performances
            };
        } else {
            return {
                success: false,
                message: 'No flight performances found'
            };
        }
    } catch (err) {
        console.error('Error in getAllFlightPerformances:', err.message);
        return {
            error: 'Internal Server Error'
        };
    }
};

exports.getAllFlights = async (req, res) => {
    try {
        const flights = await reportModel.getAllFlights();
        if (flights.length > 0) {
            res.status(200).json({
                success: true,
                message: 'Flight names retrieved successfully',
                data: flights
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No flights found'
            });
        }
    } catch (err) {
        console.error('Error in getAllFlights:', err.message);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
};
