const accountSid = 'AC1f5ee8ca87cc94608b198a68ab4ddba4';
const authToken = 'a22b7fd63120d7588e37fade4b043cb6';
const client = require('twilio')(accountSid, authToken);

const messageTemplates = {
    'Arrived': {
        'shipper': 'HX851b57f0467d21485b0e5a0eb527e4d6',
        'consignee': 'HX887266858c46a31c27b5be80f56c3794'
    },
    'Departed': 'HX74a5b9a1a5a8f4c6a9330b4f1053a941',
    'Booked': 'HX5848ca31e7c87e518cb9cdc9d3f10c17',
    'Unallocated': 'HX5848ca31e7c87e518cb9cdc9d3f10c17',
    'Default': 'HXe2c8de5f42942a3bfa73e769baaf3c8a'
};

const getContentVariables = (status, bookingDetails) => {
    const [email, shipperName, awb, bookingStatus, arrival, departure, whatsapp, whatsapp2, date, routing, role] = bookingDetails;

    switch (status) {
        case 'Arrived':
            return {
                'shipperName': shipperName || '',
                'awb': awb || '',
                'arrival': arrival || ''
            };
        case 'Unallocated':
            return {
                'shipperName': shipperName || '',
                'awb': awb || '',
                'routing': routing || '',
                'awbURL': 'www.google.com'
            };
        case 'Departed':
            return {
                'shipperName': shipperName || '',
                'awb': awb || '',
                'routing': routing || '',
                'departure': departure || '',
                'dateFlight': date || ''
            };
        case 'Booked':
            return {
                'shipperName': shipperName || '',
                'awb': awb || '',
                'routing': routing || '',
                'awbURL': ''
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

        console.log('Sender WhatsApp:', whatsapp);
        console.log('Content SID:', contentSid);

        const message = await client.messages.create({
            messagingServiceSid: 'MG9c61a3f70c4510c0c3d592173d32faf6',
            to: `whatsapp:${whatsapp}`,
            from: 'whatsapp:+923009443257',
            contentSid: contentSid,
            contentVariables: JSON.stringify(contentVariables)
        });

        console.log('WhatsApp message sent successfully:', message.sid);
    } catch (error) {
        console.error('Error sending WhatsApp message:', error.message);
    }
};

module.exports = sendWhatsAppMessage;

// Test runner
// const testSendWhatsAppMessage = async () => {
//     const testTo = '+923174532990';
//     const testStatus = 'Booked'; 
//     const testData = [
//         'ishaafsalman@gmail.com',
//         'Shaaf Salman',
//         '9910000000079',
//         'Unallocated',
//         'Dubai',
//         'Bossaso',
//         '+923174532990',
//         '+923174532990',
//         '00-00-0000',
//         'Bossaso-Dubai',
//         'shipper' // Role added as the last element
//     ];

//     await sendWhatsAppMessage(testTo, testStatus, testData);
// };

// testSendWhatsAppMessage()
//     .then(() => console.log('Test message sent successfully'))
//     .catch(err => console.error('Error in test runner:', err));
