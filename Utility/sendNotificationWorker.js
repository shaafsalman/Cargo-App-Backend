const { parentPort } = require('worker_threads');
const StatusEmailSender = require('./StatusEmailSender');


parentPort.on('message', async (data) => {
    const { email, name, awb, status, arrival, departure, phone, whatsapp,flightDate,routing,role,bookingDetails } = data;
    
    console.log("sending notification worker ");

    try {
        StatusEmailSender( email, name, awb, status, arrival, departure, phone, whatsapp,flightDate,routing,role,bookingDetails);
        parentPort.postMessage({ success: true });
    } catch (error) {
        parentPort.postMessage({ success: false, error: error.message });
    }
});
