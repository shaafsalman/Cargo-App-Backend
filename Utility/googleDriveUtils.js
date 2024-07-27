// const nodemailer = require('nodemailer');
// const sendWhatsAppMessage = require('./sendWhatsAppMessage');
// const BookingFormModel = require('../models/bookingFormModel');
// const generateAirWaybillHTML = require('./AirWaybillForm');
// const fs = require('fs');
// const path = require('path');
// const { google } = require('googleapis');

// const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
// const TOKEN_PATH = 'token.json';
// const CREDENTIALS_PATH = 'credentials.json';

// let bookingFormModel;
// connectToDatabase().then(pool => {
//     bookingFormModel = new BookingFormModel(pool);
// }).catch(err => {
//     console.error('Unable to connect to the database:', err);
// });

// const StatusEmailSender = async (email, name, awb, status, arrival, departure, phone, whatsapp, flightDate, routing, role) => {
//     console.log("Es", email, name, awb, status, arrival, departure, phone, whatsapp, flightDate, routing);

//     try {
//         const transporter = nodemailer.createTransport({
//             host: 'sg2plzcpnl491722.prod.sin2.secureserver.net',
//             port: 465,
//             secure: true,
//             auth: {
//                 user: 'daalloairlines@daallocargo.com',
//                 pass: 'trEWY(racO4B'
//             }
//         });

//         const emailBodyHTML = `
//             <!-- Your HTML content -->
//         `;

//         let awbHtml;
//         let awbUrl = '';

//         if (status === 'Booked') {
//             const bookingDetailsArray = await bookingFormModel.getBookingByAwb(awb);
//             const bookingDetails = bookingDetailsArray[0];
//             awbHtml = generateAirWaybillHTML(bookingDetails);
//             const filePath = path.join(__dirname, 'AirWaybill.html');
            
//             fs.writeFileSync(filePath, awbHtml);
            
//             awbUrl = await uploadToGoogleDrive(filePath);
//         }

//         const mailOptions = {
//             from: 'daalloairlines@daallocargo.com',
//             to: email,
//             subject: 'Status Update',
//             html: emailBodyHTML
//         };

//         const bookingDetails = [
//             email, name, awb, status, arrival, departure, phone, whatsapp, flightDate, routing, role
//         ];

//         await sendWhatsAppMessage(whatsapp, status, bookingDetails);
//         await transporter.sendMail(mailOptions);
//         console.log('Status email sent successfully');
//     } catch (error) {
//         if (error.response && error.response.body) {
//             console.error('Error response from server:', error.response.body);
//         } else {
//             console.error('Error sending status email:', error.message);
//         }
//     }
// };

// module.exports = StatusEmailSender;

// async function uploadToGoogleDrive(filePath) {
//     const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
//     const { client_secret, client_id, redirect_uris } = credentials.installed;
//     const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

//     // Check if we have previously stored a token.
//     const token = fs.existsSync(TOKEN_PATH) ? JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8')) : null;

//     if (!token) {
//         return getAccessToken(oAuth2Client);
//     }

//     oAuth2Client.setCredentials(token);

//     const drive = google.drive({ version: 'v3', auth: oAuth2Client });

//     const fileMetadata = {
//         'name': 'AirWaybill.html'
//     };
//     const media = {
//         mimeType: 'text/html',
//         body: fs.createReadStream(filePath)
//     };

//     const file = await drive.files.create({
//         resource: fileMetadata,
//         media: media,
//         fields: 'id'
//     });

//     const fileId = file.data.id;

//     await drive.permissions.create({
//         resource: {
//             'type': 'anyone',
//             'role': 'reader',
//         },
//         fileId: fileId,
//         fields: 'id',
//     });

//     const fileDetails = await drive.files.get({
//         fileId: fileId,
//         fields: 'webViewLink, webContentLink',
//     });

//     return fileDetails.data.webViewLink;
// }

// function getAccessToken(oAuth2Client) {
//     const authUrl = oAuth2Client.generateAuthUrl({
//         access_type: 'offline',
//         scope: SCOPES,
//     });

//     console.log('Authorize this app by visiting this url:', authUrl);
//     const readline = require('readline');
//     const rl = readline.createInterface({
//         input: process.stdin,
//         output: process.stdout,
//     });

//     return new Promise((resolve, reject) => {
//         rl.question('Enter the code from that page here: ', (code) => {
//             rl.close();
//             oAuth2Client.getToken(code, (err, token) => {
//                 if (err) return reject('Error retrieving access token');
//                 oAuth2Client.setCredentials(token);
//                 fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
//                 resolve(uploadToGoogleDrive(filePath));
//             });
//         });
//     });
// }
