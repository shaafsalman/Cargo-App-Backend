const { parentPort } = require('worker_threads');
const StatusEmailSender = require('./StatusEmailSender');


parentPort.on('message', async (data) => {
    const { email, name, awb, status, arrival, departure, phone, whatsapp,flightDate,routing,role } = data;
    
    try {
        StatusEmailSender( email, name, awb, status, arrival, departure, phone, whatsapp,flightDate,routing,role);
        parentPort.postMessage({ success: true });
    } catch (error) {
        parentPort.postMessage({ success: false, error: error.message });
    }
});
