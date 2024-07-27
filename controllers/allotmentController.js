const AllotmentModel = require('../models/allotmentModel');
const BookingModel = require('../models/bookingFormModel');
const { connectToDatabase } = require('../db');
const StatusEmailSender = require('../Utility/StatusEmailSender');
const { Worker } = require('worker_threads');
const path = require('path');

let allotmentModel;
let bookingModel



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




connectToDatabase()
    .then(pool => {
        allotmentModel = new AllotmentModel(pool);
        bookingModel = new BookingModel(pool);
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });
    exports.allocateBooking = async (data) => {
        const { scheduleId, awbs ,newUsedCapacity } = data;
        
        try {
            const updateSuccess = await allotmentModel.updateScheduleUsedCapacity(scheduleId, newUsedCapacity); 
           if(!updateSuccess)
           {
            return { success: false, message: 'Capacity Error'};

           }
           
            for (const awb of awbs) {
                const success = await allotmentModel.allocateBooking(awb, scheduleId);
            //     if (!success) {
    
            //         return { success: false, message: `Failed to allocate booking for AWB ${awb}.` };
            //     }
            //     const bookingDetailsArray = await bookingModel.getBookingByAwb(awb);
            //     const bookingDetails = bookingDetailsArray[0];
            //     const notificationData = [
            //     {
            //         email: bookingDetails.consigneeEmail,
            //         name: bookingDetails.consigneeName,
            //         awb: bookingDetails.awb,
            //         status: bookingDetails.status,
            //         arrival: bookingDetails.toRegion,  
            //         departure: bookingDetails.fromRegion,  
            //         phone: bookingDetails.consigneePhone,
            //         whatsapp: bookingDetails.consigneeWhatsapp,
            //         flightDate:bookingDetails.flightDate,
            //         routing: bookingDetails.fromRegion + '-' + bookingDetails.toRegion
            //     }
            // ];
            
            // const notificationData2 = [
            //     {
            //         email: bookingDetails.shipperEmail,
            //         name: bookingDetails.shipperName,
            //         awb: bookingDetails.awb,
            //         status: bookingDetails.status,
            //         arrival: bookingDetails.toRegion,  
            //         departure: bookingDetails.fromRegion, 
            //         phone: bookingDetails.shipperPhone,
            //         whatsapp: bookingDetails.shipperWhatsapp,
            //         flightDate:bookingDetails.flightDate,
            //         routing: bookingDetails.fromRegion + '-' + bookingDetails.toRegion
            //     }
            // ];
        
            //     notificationData2.forEach(sendNotifications);
            //     notificationData.forEach(sendNotifications);
             }


            return { success: true, message: 'All bookings allocated successfully.' };
        } 
        catch (err) {
            console.error('Error allocating booking:', err);
            return { success: false, message: 'Database error: ' + err.message };
        }
    };
    exports.departBookings = async (data) => {
        const { scheduleId, masterAwb } = data;
    
        try {
            const { success, awbs } = await allotmentModel.updateScheduleStatusToDeparted(scheduleId, masterAwb);
    
            if (!success) {
                return { success: false, message: `Failed to depart schedule ID ${scheduleId}.` };
            }
    
            for (const awb of awbs) {
                const bookingDetailsArray = await bookingModel.getBookingByAwb(awb);
    
                if (bookingDetailsArray.length > 0) {
                    const bookingDetails = bookingDetailsArray[0];
    
                    // const notificationData = {
                    //     email: bookingDetails.consigneeEmail,
                    //     name: bookingDetails.consigneeName,
                    //     awb: bookingDetails.awb,
                    //     status: bookingDetails.status,
                    //     arrival: bookingDetails.toRegion,
                    //     departure: bookingDetails.fromRegion,
                    //     phone: bookingDetails.consigneePhone,
                    //     whatsapp: bookingDetails.consigneeWhatsapp,
                    //     flightDate: bookingDetails.flightDate,
                    //     routing: `${bookingDetails.fromRegion}-${bookingDetails.toRegion}`
                    // };
    
                    const notificationData2 = {
                        email: bookingDetails.shipperEmail,
                        name: bookingDetails.shipperName,
                        awb: bookingDetails.awb,
                        status: bookingDetails.status,
                        arrival: bookingDetails.toRegion,
                        departure: bookingDetails.fromRegion,
                        phone: bookingDetails.shipperPhone,
                        whatsapp: bookingDetails.shipperWhatsapp,
                        flightDate: bookingDetails.flightDate,
                        routing: `${bookingDetails.fromRegion}-${bookingDetails.toRegion}`
                    };
    
                    // Send notifications
                    // await sendNotifications(notificationData);
                    await sendNotifications(notificationData2);
                } else {
                    console.warn(`No details found for AWB ${awb}`);
                }
            }
    
            return { success: true, message: 'Schedule and bookings departed successfully.' };
        } catch (err) {
            console.error('Error departing bookings:', err);
            return { success: false, message: 'Database error: ' + err.message };
        }
    }    

    exports.arriveBookings = async (data) => {
        const { scheduleId } = data;
    
        try {
            const { success, awbs } = await allotmentModel.updateScheduleStatusToArrived(scheduleId);
            
            if (!success) {
                return { success: false, message: `Failed to arrive schedule ID ${scheduleId}.` };
            }
    
            for (const awb of awbs) 
            {
                const bookingDetailsArray = await bookingModel.getBookingByAwb(awb);
                const bookingDetails = bookingDetailsArray[0];
                const notificationData = [
                {
                    role: "consignee",
                    email: bookingDetails.consigneeEmail,
                    name: bookingDetails.consigneeName,
                    awb: bookingDetails.awb,
                    status: bookingDetails.status,
                    arrival: bookingDetails.toRegion,  
                    departure: bookingDetails.fromRegion,  
                    phone: bookingDetails.consigneePhone,
                    whatsapp: bookingDetails.consigneeWhatsapp,
                    flightDate:bookingDetails.flightDate,
                    routing: bookingDetails.fromRegion + '-' + bookingDetails.toRegion
                }
            ];
            
            const notificationData2 = [
                {
                    role: "shipper",
                    email: bookingDetails.shipperEmail,
                    name: bookingDetails.shipperName,
                    awb: bookingDetails.awb,
                    status: bookingDetails.status,
                    arrival: bookingDetails.toRegion,  
                    departure: bookingDetails.fromRegion, 
                    phone: bookingDetails.shipperPhone,
                    whatsapp: bookingDetails.shipperWhatsapp,
                    flightDate:bookingDetails.flightDate,
                    routing: bookingDetails.fromRegion + '-' + bookingDetails.toRegion
                     
                }
            ];
        
                notificationData2.forEach(sendNotifications);
                notificationData.forEach(sendNotifications);
               
            }
    
            return { success: true, message: 'Schedule and bookings arrived successfully.' };
        } catch (err) {
            console.error('Error arriving bookings:', err);
            return { success: false, message: 'Database error: ' + err.message };
        }
    };
    
    

    exports.deallocateBooking = async (data) => {
        const { scheduleId, awb } = data; 
    
        try {
            const success = await allotmentModel.deallocateBooking(scheduleId, awb); 
            if (success) 
            {
                return { success: true, message: 'Booking deallocated successfully.' };
            } else {
        
                return { success: false, message: 'Failed to deallocate booking.' };
            }
        } catch (err) {
            console.error('Error deallocating booking:', err);
            return { success: false, message: 'Database error: ' + err.message };
        }
    };

exports.getAllocatedBookings = async (scheduleId) => {
    try {
        const bookings = await allotmentModel.getAllocatedBookings(scheduleId);
        return { success: true, data: bookings };
    } catch (err) {
        console.error('Error fetching allocated bookings:', err);
        return { success: false, message: 'Database error: ' + err.message };
    }
};

exports.getAllAllocations = async () => {
    try {
        const allocations = await allotmentModel.getAllAllocations();
        return { success: true, data: allocations };
    } catch (err) {
        console.error('Error fetching all allocations:', err);
        return { success: false, message: 'Database error: ' + err.message };
    }
};
