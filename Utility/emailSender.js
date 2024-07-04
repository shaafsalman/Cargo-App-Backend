// const nodemailer = require('nodemailer');

// const sendVerificationEmail = async (email) => {
//     try {
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: 'ishaafsalman@gmail.com',
//                 pass: 'kzza ocxb rjdj ffcw'
//             }
//         });

//         const emailBodyHTML = `
//         <body style="margin: 0; padding: 0; font-family: 'Poppins', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; display: flex; justify-content: center; align-items: center; min-height: 100vh;">

//         <div style="max-width: 1000px; background-color: #ffffff; padding: 24px; box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1); border-radius: 12px; color: #212529;">
    
//             <div style="text-align: center;">
//                 <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 16px; color: #343a40;">Email From Shaaf Salman</h1>

//                 <div style="overflow: hidden; border-radius: 12px; margin-bottom: 24px; max-height: 50vh;">
//                 </div>          
//             </div>
//         </div>
//         </body>
//         `;

//         const mailOptions = {
//             from: 'ishaafsalman@gmail.com',
//             to: email,
//             subject: 'Email Verification',
//             html: emailBodyHTML
//         };

//         await transporter.sendMail(mailOptions);
//         console.log('Verification email sent successfully');
//     } catch (error) {
//         console.error('Error sending verification email:', error);
//     }
// };

// module.exports.sendVerificationEmail = sendVerificationEmail;
