const nodemailer = require('nodemailer');
const sendWhatsAppMessage = require('./sendWhatsAppMessage');


const AccountEmailSender = async (email,name,password,role) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'sg2plzcpnl491722.prod.sin2.secureserver.net', 
            port: 465, 
            secure: true, 
            auth: {
                user: 'admin@daallocargo.com', 
                pass: 'Afnan@2024' 
            }
        });

        const emailBodyHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Daallo Airlines</title>
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
            border: 3px solid #048b4c; /* Border color */
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .email-body {
            line-height: 1.6;
            font-size: 16px;
            color: #333;
        }
        .greeting {
            font-size: 22px;
            color: #048b4c; /* Greeting color */
            margin: 0;
            font-weight: 700;
        }
        .info {
            background-color: #048b4c; /* Primary color */
            color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-top: 20px;
            border: 2px solid #e0e0e0; /* Border color */
        }
        .info .info-heading {
            font-weight: bold;
            color: #ffffff;
            font-size: 16px;
            margin-bottom: 5px;
        }
        .info .info-detail {
            display: block;
            font-size: 18px;
            background-color: #ffffff;
            color: #333;
            padding: 15px;
            border-radius: 8px;
            font-weight: bold;
            text-align: center;
            border: 2px solid #048b4c; /* Border color */
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Shadow for prominence */
            margin-bottom: 15px;
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
            color: #048b4c; /* Footer link color */
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
            .info {
                padding: 15px;
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
            <div class="info">
                <p class="info-heading">You have successfully registered as an <strong>${role}</strong>.</p>
                <p class="info-heading">Your Email:</p>
                <p class="info-detail">${email}</p>
                <p class="info-heading">Your Password:</p>
                <p class="info-detail">${password}</p> <!-- Highlight password -->
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

        const mailOptions = {
            from: 'daalloairlines@daallocargo.com', 
            to: email,
            subject: 'Account Registration',
            html: emailBodyHTML
        };

        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');
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

module.exports = AccountEmailSender;
