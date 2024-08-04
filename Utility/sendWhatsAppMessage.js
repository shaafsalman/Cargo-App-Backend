require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = twilio(accountSid, authToken);


const messageTemplates = {
    'Arrived': {
        'shipper': process.env.ARRIVED_SHIPPER_SID,
        'consignee': process.env.ARRIVED_CONSIGNEE_SID
    },
    'Departed': process.env.DEPARTED_SID,
    'Booked': process.env.BOOKED_SID,
    'Unallocated': process.env.UNALLOCATED_SID,
    'Default': process.env.DEFAULT_SID
};

const getContentVariables = (status, bookingDetails) => {
    const [email, shipperName, awb, bookingStatus, arrival, departure, phone, whatsapp, flightDate, routing, role, awbUrl] = bookingDetails;

    switch (status) {
        case 'Arrived':
            return {
                'shipperName': shipperName || '',
                'awb': awb || '',
                'arrival': arrival || '',
                'arrDate': flightDate || '',
                'departure': departure || ''
            };
        case 'Departed':
            return {
                'shipperName': shipperName || '',
                'awb': awb || '',
                'routing': routing || '',
                'departure': departure || '',
                'dateFlight': flightDate || '',
                'arrival': arrival || ''
                
            };
        case 'Booked':
            return {
                'shipperName': shipperName || '',
                'awb': awb || '',
                'routing': routing || '',
                'awbURL': awbUrl || ''  
            };
        default:
            return {};
    }
};

const sendWhatsAppMessage = async (whatsapp, status, bookingDetails) => {
    try {
        let contentSid;
        if (status === 'Arrived') {
            const role = bookingDetails[10];
            contentSid = messageTemplates['Arrived'][role] || messageTemplates['Default'];
        } else {
            contentSid = messageTemplates[status] || messageTemplates['Default'];
        }

        const contentVariables = getContentVariables(status, bookingDetails);
        // console.log(contentVariables);

        console.log('Sender WhatsApp:', whatsapp);
        console.log('Content SID:', contentSid);

        const message = await client.messages.create({
            messagingServiceSid: process.env.MESSAGING_SERVICE_SID,
            to: `whatsapp:${whatsapp}`,
            from: 'whatsapp:+971586329711',
            contentSid: contentSid,
            contentVariables: JSON.stringify(contentVariables)
        });

        console.log('WhatsApp message sent successfully:', message.sid);
    } catch (error) {
        console.error('Error sending WhatsApp message:', error.message);
    }
};

module.exports = sendWhatsAppMessage;


