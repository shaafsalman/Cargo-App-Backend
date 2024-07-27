const nodemailer = require('nodemailer');
const sendWhatsAppMessage = require('./sendWhatsAppMessage');
const BookingFormModel = require('../models/bookingFormModel');
let bookingFormModel;
const generateAirWaybillHTML = require('./AirWaybillForm');
const fs = require('fs');
const path = require('path');
const fs = require('fs');
const path = require('path');
const { uploadToGoogleDrive } = require('./googleDriveUtils');


connectToDatabase().then(pool => {
    bookingFormModel = new BookingFormModel(pool);
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = 'token.json';
const CREDENTIALS_PATH = 'credentials.json';



const StatusEmailSender = async (email, name, awb, status, arrival, departure, phone, whatsapp,flightDate,routing,role) => {
  console.log("Es",email, name, awb, status, arrival, departure, phone, whatsapp,flightDate,routing)

    try {
        const transporter = nodemailer.createTransport({
            host: 'sg2plzcpnl491722.prod.sin2.secureserver.net', 
            port: 465, 
            secure: true, 
            auth: {
                user: 'daalloairlines@daallocargo.com', 
                pass: 'trEWY(racO4B' 
            }
        });

        const emailBodyHTML = `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AWB Status Update</title>
    <style>
        /* General Styles */
        body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background-color: #f9f9f9;
            color: #333;
        }
        .email-container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            padding: 20px;
            box-sizing: border-box;
        }
        .email-header {
            text-align: center;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .email-header img {
            width: 250px;
            height: auto;
            display: block;
            margin: 0 auto;
        }
        .email-body {
            line-height: 1.6;
            font-size: 16px;
            color: #333;
        }
        .greeting {
            font-size: 20px;
            color: #048b4c;
            margin: 0;
            font-weight: 700;
        }
        .route-info {
            background-color: #f0f8f0;
            border: 1px solid #048b4c;
            border-radius: 6px;
            padding: 10px;
            margin-top: 20px;
            text-align: center;
        }
        .route-info p {
            margin: 0;
            font-size: 16px;
            color: #333;
        }
        .route-info .route-details {
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 18px;
            font-weight: 600;
            color: #048b4c;
        }
        .route-info .arrow {
            font-size: 20px;
            margin: 0 10px;
        }
        .status-highlight {
            background-color: #048b4c;
            color: #ffffff;
            padding: 15px;
            border-radius: 6px;
            margin-top: 20px;
            text-align: center;
        }
        .status-highlight p {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
        }
        .status-highlight .status-details {
            font-size: 16px;
            margin-top: 5px;
        }
        .email-footer {
            text-align: center;
            padding: 15px;
            border-top: 2px solid #e0e0e0;
            margin-top: 20px;
            font-size: 14px;
            color: #555;
        }
        .email-footer a {
            color: #048b4c;
            text-decoration: none;
            font-weight: bold;
        }
        /* Responsive Styles */
        @media screen and (max-width: 600px) {
            .email-container {
                padding: 15px;
            }
            .email-header img {
                width: 160px;
            }
            .route-info, .status-highlight {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <img src="https://i.ibb.co/vc2rV3V/Daallo-Logo1.png" alt="Daallo Airlines Logo">
        </div>
        <div class="email-body">
            <p class="greeting">Dear ${name},</p>
            <p>Your cargo status has been updated!</p>
            
            <div class="route-info">
                <p><strong>Route:</strong></p>
                <div class="route-details">
                    <span>${departure}</span>
                    <span class="arrow">→</span>
                    <span>${arrival}</span>
                </div>
            </div>

            <div class="status-highlight">
                <p><strong>AWB Number:</strong> ${awb}</p>
                <p class="status-details"><strong>Status:</strong> ${status}</p>
            </div>
        </div>
        <div class="email-footer">
            <p>Thank you for choosing Daallo Airlines. For more information, visit our website:</p>
            <p><a href="https://daallocargo.com/" target="_blank">daallocargo.com</a></p>
        </div>
    </div>
</body>
</html>

        `;



        let awbHtml;
        let awbUrl = '';

        if (status === 'Booked') {
            const bookingDetailsArray = await bookingFormModel.getBookingByAwb(awb);
            const bookingDetails = bookingDetailsArray[0];
            awbHtml = generateAirWaybillHTML(bookingDetails);
            const filePath = path.join(__dirname, 'AirWaybill.html');
            
            fs.writeFileSync(filePath, awbHtml);
            
            awbUrl = await uploadToGoogleDrive(filePath);
        }



        const mailOptions = {
            from: 'daalloairlines@daallocargo.com', 
            to: email,
            subject: 'Status Update',
            html: emailBodyHTML
        };
        
        
        bookingDetails=[
            email, name, awb, status, arrival, departure, phone, whatsapp,flightDate,routing,role
        ]
        

        
        await sendWhatsAppMessage(whatsapp,status, bookingDetails);

        await transporter.sendMail(mailOptions);
        // console.log('Verification email sent successfully');
    } catch (error) {
        if (error.response && error.response.body) {
            console.error('Error response from server:', error.response.body);
        } else {
            console.error('Error sending verification email:', error.message);
        }
    }
};

// // Execute the function to send the verification email
// sendVerificationEmail()
//     .then(() => console.log('Email function executed'))
//     .catch(err => console.error('Unhandled error:', err));

module.exports = StatusEmailSender;
