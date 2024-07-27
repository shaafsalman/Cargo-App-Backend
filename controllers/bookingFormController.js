const BookingFormModel = require('../models/bookingFormModel');
const { connectToDatabase } = require('../db');
const StatusEmailSender = require('../Utility/StatusEmailSender'); 
const { Worker } = require('worker_threads');
let bookingFormModel;
const path = require('path');


const sendNotifications = (data) => {
    const workerPath = path.resolve(__dirname, '../Utility/sendNotificationWorker');
    const worker = new Worker(workerPath);
    worker.postMessage(data);
    worker.on('message', (result) => {
        if (!result.success) {
            console.error('Error sending notification:', result.error);
        }
    });
};



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
        // console.log(bookingData);

        // Extract shipper data
        const shipperData = {
            name: bookingData.shipperName,
            phone: bookingData.shipperPhone,
            whatsapp: bookingData.shipperWhatsapp,
            email: bookingData.shipperEmail,
            address: bookingData.shipperAddress,
            city: bookingData.shipperCity,
            province: "null",
            country: bookingData.shipperCountry,
        };

        // Extract consignee data
        const consigneeData = {
            name: bookingData.consigneeName,
            phone: bookingData.consigneePhone,
            whatsapp: bookingData.consigneeWhatsapp,
            email: bookingData.consigneeEmail,
            address: bookingData.consigneeAddress,
            province: "null",
            city: bookingData.consigneeCity,
            country: bookingData.consigneeCountry,
        };

        // Extract main booking data
        const mainBookingData = {
            rate: bookingData.rate,
            dummy: bookingData.dummy,
            connectionid: bookingData.connectionid,
            paymentTerms: bookingData.paymentTerms,
            cargoRateId: bookingData.cargoRateId,
            totalInputWeight: bookingData.totalInputWeight,
            totalVolumetricWeight: bookingData.totalVolumetricWeight,
            finalWeight: bookingData.finalWeight,
            shipper_notes: bookingData.notes,
            packages_count: bookingData.totalPackages,
            dangerous_goods_codes: bookingData.dangerousGoods.map(dg => dg.code).join(','),
            goods_descriptions_codes: bookingData.goodsDescriptions.map(gd => gd.code).join(','),
            special_handling_codes: bookingData.specialHandling.map(sh => sh.code).join(','),
            status: 'Unallocated', 
            createdBy: bookingData.createdBy,
            createdById: bookingData.createdById,
            userEmail: bookingData.userEmail,
            created_at: new Date(), 
            updated_at: new Date(), 
        };

        // 1. Create Shipper and Consignee Records to Obtain IDs
        const shipperId = await bookingFormModel.addShipper(shipperData);
        const consigneeId = await bookingFormModel.addConsignee(consigneeData);

        // 2. Create Main Booking and Get AWB
        const awb = await bookingFormModel.addBooking({
            ...mainBookingData,
            shipper_id: shipperId,
            receiver_id: consigneeId
        });

        // 3. Create Package Entries
        const packageEntries = bookingData.packages.map(pkg => ({
            length: pkg.length,
            width: pkg.width,
            height: pkg.height,
            weight: pkg.weight,
            count: pkg.count,
            booking_id: awb
        }));

     

        // console.log("shipper",shipperData);
        // console.log("consignee",consigneeData);
        // console.log("Booking",mainBookingData);
        // console.log("awb", awb);
        // console.log("Packages", packageEntries);

        await Promise.all(packageEntries.map(pkg => bookingFormModel.addPackage(pkg)));

        
        const bookingDetailsArray = await bookingFormModel.getBookingByAwb(awb);
        const bookingDetails = bookingDetailsArray[0];
        // const notificationData = [
        // {
        //     email: bookingDetails.consigneeEmail,
        //     name: bookingDetails.consigneeName,
        //     awb: bookingDetails.awb,
        //     status: bookingDetails.status,
        //     arrival: bookingDetails.toRegion,  
        //     departure: bookingDetails.fromRegion,  
        //     phone: bookingDetails.consigneePhone,
        //     whatsapp: bookingDetails.consigneeWhatsapp,
        //     flightDate:bookingDetails.flightDate,
        //     routing: bookingDetails.fromRegion + '-' + bookingDetails.toRegion
        // }
    // ];
    
    const notificationData2 = [
        {
            email: bookingDetails.shipperEmail,
            name: bookingDetails.shipperName,
            awb: bookingDetails.awb,
            status: "Booked",
            arrival: bookingDetails.toRegion,  
            departure: bookingDetails.fromRegion, 
            phone: bookingDetails.shipperPhone,
            whatsapp: bookingDetails.shipperWhatsapp,
            flightDate:bookingDetails.flightDate,
            routing: bookingDetails.fromRegion + '-' + bookingDetails.toRegion
        }
    ];

    // Prepare notification data based on booking details
        notificationData2.forEach(sendNotifications);
        // notificationData.forEach(sendNotifications);


        // console.log("here,bookingDetails",bookingDetails)

        return { success: true, awb };
        
    } catch (err) {
        console.error('Error creating booking:', err);
        return { success: false, error: err.message };
    }
};


exports.deleteBookingForm = async (awb) => {
    try {
        const result = await bookingFormModel.deleteBookingForm(awb);
        return({ success: result });
    } catch (err) {
        console.error(`Error deleting booking ${awb}:`, err);
        return({ error: 'Error deleting booking: ' + err.message });
    }
};
exports.getBookingsByToId = async (toId) => {
    try {
        const bookings = await bookingFormModel.getBookingsByToId(toId);
        return { bookings };
    } catch (err) {
        console.error(`Error fetching bookings by toId ${toId}:`, err);
        return { error: 'Error fetching bookings: ' + err.message };
    }
};
exports.updateBookingStatusToDelivered = async (awb) => {
  console.log('Updating bookings controller');
    try {
        const result = await bookingFormModel.updateBookingStatusToDelivered(awb);
        return({ success: result });
    } 
    catch (err) 
    {
        console.error(`Error updating booking ${awb}:`, err);
        return({ error: 'Error updating Status: ' + err.message });
    }
};
exports.getBookingsByToId = async (toId) => {
    try {
        const bookings = await bookingFormModel.getBookingsByToId(toId);
        return { bookings };
    } catch (err) {
        console.error(`Error fetching bookings by toId ${toId}:`, err);
        return { error: 'Error fetching bookings: ' + err.message };
    }
};


exports.getBookingByAwb = async (req) => {
    const { awb } = req.query; // Extract 'awb' from query parameters
    try {
        const booking = await bookingFormModel.getBookingByAwb(awb);
        if (booking) {
            return { success: true, bookings: booking }; // Return booking data in 'bookings'
        } else {
            return { success: false, message: 'No bookings found for the specified AWB' };
        }
    } catch (err) {
        console.error(`Error fetching booking ${awb}:`, err);
        return { success: false, message: 'Internal server error' };
    }
};


exports.getBookingsByRouteID = async (routeID) => {
    try {
        const bookings = await bookingFormModel.getBookingsByRouteID(routeID);
        
        if (bookings.length > 0) {
            return { success: true, bookings };
        } 
        else 
        {
            return { success: false, message: `bookings with FromID ${fromId} and ToID ${toId} not found` };
        }
    } catch (err) {
        console.error(`Error in getBookingsByFromToIds controller: ${err.message}`);
        throw err;
    }
};


exports.getBookingStatistics = async (id, email) => {
    try 
    {
        const result = await bookingFormModel.getBookingStatistics(id, email);
        if (!result || result.length === 0) {
            return {}; 
        }

        return result; 

    } catch (err) {
        console.error('Error retrieving active bookings:', err.message);
        throw err; 
    }

};

exports.getActiveBooking = async (id, email) => {
    try {
        const result = await bookingFormModel.getActiveBooking(id, email);

        if (!result || result.length === 0) {
            return {}; 
        }

        return result; 
    } catch (err) {
        console.error('Error retrieving active bookings:', err.message);
        throw err;
    }

};


exports.getAllBooking = async (id, email) => {
    try {
        const result = await bookingFormModel.getAllBooking(id, email);

        if (!result || result.length === 0) {
            return {}; 
        }

        return result; 
    } catch (err) {
        console.error('Error retrieving all bookings:', err.message);
        throw err; 
    }
};

exports.getTotalBooking = async () => {
    try {
        const result = await bookingFormModel.getTotalBooking();

        // Check if result is null, undefined, or an empty array
        if (!result || result.length === 0) {
            return {}; 
        }

        return result; 
    } catch (err) {
        console.error('Error retrieving all bookings:', err.message);
        throw err; // Propagate the error to handle it higher up in the call stack
    }
};


exports.getShippersDetails = async ( createdById,userEmail) => {
    try {
        const shippers = await bookingFormModel.getShippersDetails(userEmail, createdById);
        
        if (!shippers || shippers.length === 0) {
            return { error: 'No shippers found' };
        }
        
        return shippers;
    } catch (err) {
        console.error('Error fetching shippers details:', err);
        throw new Error('Error fetching shippers details: ' + err.message);
    }
};

exports.getConsigneeDetails = async (createdById,userEmail) => {
    try {
        // console.log('Getting in cotnrollers...',userEmail, createdById);
        const consignees = await bookingFormModel.getConsigneesDetails(userEmail, createdById);
        
        if (!consignees || consignees.length === 0) {
            return { error: 'No Consignees found' };
        }
        
        return consignees;
        
    } catch (err) {
        console.error('Error fetching consignees details:', err);
        throw new Error('Error fetching consignees details: ' + err.message);
    }
};

// Function to fetch all cargo categories
exports.getAllCargoCategories = async () => {
    try {
        const cargoCategories = await bookingFormModel.getAllCargoCategories();
        
        if (!cargoCategories || cargoCategories.length === 0) {
            return { error: 'No cargo categories found' };
        }
        
        return cargoCategories;
    } catch (err) {
        console.error('Error fetching all cargo categories:', err);
        throw new Error('Error fetching all cargo categories: ' + err.message);
    }
};

// Function to fetch all special handling codes
exports.getAllSpecialHandlingCodes = async () => {
    try {
        const specialHandlingCodes = await bookingFormModel.getAllSpecialHandlingCodes();
        
        if (!specialHandlingCodes || specialHandlingCodes.length === 0) {
            return { error: 'No special handling codes found' };
        }
        
        return specialHandlingCodes;
    } catch (err) {
        console.error('Error fetching all special handling codes:', err);
        throw new Error('Error fetching all special handling codes: ' + err.message);
    }
};

// Function to fetch all cargo descriptions
exports.getDangerousGoods = async () => {
    try {
        // console.log("in controller");

        const dangerousGoods = await bookingFormModel.getAllDangerousGoods();
        
        if (!dangerousGoods || dangerousGoods.length === 0) {
            return { error: 'No Dangerous Goods found' };
        }
        
        return dangerousGoods;

    } catch (err) {
        console.error('Error fetching all Dangerous Goods:', err);
        throw new Error('Error fetching all Dangerous Goods: ' + err.message);
    }
};