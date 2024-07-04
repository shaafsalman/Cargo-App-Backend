const BookingFormModel = require('../models/bookingFormModel');
const { connectToDatabase } = require('../db');

let bookingFormModel;

connectToDatabase().then(pool => {
    bookingFormModel = new BookingFormModel(pool);
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await bookingFormModel.getAllBookings();
        
        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ error: 'No bookings found' });
        }
        
        res.json(bookings);
    } catch (err) {
        console.error('Error fetching all bookings:', err);
        return false;
    }
};

exports.createBooking = async (bookingData) => {
    try {
        const result = await bookingFormModel.addBookingForm(bookingData);
         if(result)
            {
                console.log('booking saved in controller');
                return true;
            }
    } 
    catch (err)
    {
        console.error('Error creating booking:', err);
        return false;
    }
};

exports.deleteBooking = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await bookingFormModel.deleteBookingForm(id);
        res.json({ success: result });
    } catch (err) {
        console.error(`Error deleting booking ${id}:`, err);
        res.status(500).json({ error: 'Error deleting booking: ' + err.message });
    }
};

exports.getBookingById = async (req, res) => {
    const { id } = req.params;
    try {
        const booking = await bookingFormModel.getBookingFormById(id);
        if (booking) {
            res.json(booking);
        } else {
            res.status(404).json({ error: 'Booking not found' });
        }
    } catch (err) {
        console.error(`Error fetching booking ${id}:`, err);
        res.status(500).json({ error: 'Error fetching booking: ' + err.message });
    }
};

exports.activateBooking = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await bookingFormModel.activateBooking(id);
        res.json({ success: result });
    } catch (err) {
        console.error(`Error activating booking ${id}:`, err);
        res.status(500).json({ error: 'Error activating booking: ' + err.message });
    }
};

exports.deactivateBooking = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await bookingFormModel.deactivateBooking(id);
        res.json({ success: result });
    } catch (err) {
        console.error(`Error deactivating booking ${id}:`, err);
        res.status(500).json({ error: 'Error deactivating booking: ' + err.message });
    }
};



exports.getActiveBooking = async (id, email) => {
    try {
        const result = await bookingFormModel.getActiveBookings(id, email);

        // Check if result is null, undefined, or an empty array
        if (!result || result.length === 0) {
            return {}; // Return an empty JSON object
        }

        return result; // Return the fetched data
    } catch (err) {
        console.error('Error retrieving active bookings:', err.message);
        throw err; // Propagate the error to handle it higher up in the call stack
    }
};

exports.getAllBooking = async (id, email) => {
    try {
        const result = await bookingFormModel.getAllBookings(id, email);

        // Check if result is null, undefined, or an empty array
        if (!result || result.length === 0) {
            return {}; // Return an empty JSON object
        }

        return result; // Return the fetched data
    } catch (err) {
        console.error('Error retrieving all bookings:', err.message);
        throw err; // Propagate the error to handle it higher up in the call stack
    }
};