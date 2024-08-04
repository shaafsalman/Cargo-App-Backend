// const fs = require('fs');
// const path = require('path');
// const nodemailer = require('nodemailer');
// const sendWhatsAppMessage = require('./sendWhatsAppMessage');
// const { generateAirWaybillHTML } = require('./AirWaybillForm'); 
// const uploadToCloudinary = require('./uploadToCloudinary');
// const mkdirp = require('mkdirp');
// const puppeteer = require('puppeteer');

// const style = {
//     greeting: "font-size: 1.2em; color: #048b4c; font-weight: bold;",
//     paragraph: "font-size: 1em; color: #333;",
//     link: "font-size: 1em; color: #048b4c; font-weight: bold; text-decoration: none;",
//     signature: "font-size: 1em; color: #333; font-weight: bold;",
// };

// const loadTemplate = (status, name, awb, arrival, departure, awbUrl,flightDate) => {
//     let message = '';

//     if (status === 'Booked') {
//         message = `
//             <p style="${style.greeting}">Dear ${name},</p>
//             <p style="${style.paragraph}">Thank you for choosing <span style="font-weight: bold;">Daallo Express Cargo</span> for your shipment. Your shipment is booked under Airway Bill No. <span style="font-weight: bold; color: #048b4c;">${awb}</span> for the ${departure}-${arrival}. You can access your AWB by clicking the following link:</p>
//             <p><a href="${awbUrl}" style="${style.link}">Access your AWB</a></p>
//             <p style="${style.signature}">Sincerely,</p>
//             <p style="${style.signature}">Daallo Express Cargo</p>
//         `;
//     } else if (status === 'Departed') {
//         message = `
//             <p style="${style.greeting}">Dear ${name},</p>
//             <p style="${style.paragraph}">We are pleased to inform you that your shipment, under Airway Bill No. <span style="font-weight: bold; color: #048b4c;">${awb}</span>, has departed from ${departure} on ${flightDate} <span style="font-weight: bold; color: #048b4c;">, enroute to ${arrival}</span>.</p>
//             <p style="${style.signature}">Sincerely,</p>
//             <p style="${style.signature}">Daallo Express Cargo</p>
//         `;
//     } else if (status === 'Arrived') {
//         message = `
//             <p style="${style.greeting}">Dear ${name},</p>
//             <p style="${style.paragraph}">We are pleased to inform you that your shipment, under Airway Bill No. <span style="font-weight: bold; color: #048b4c;">${awb}</span>, has arrived from ${departure}  on ${flightDate} <span style="font-weight: bold; color: #048b4c;"></span>.</p>
//             <p style="${style.signature}">Sincerely,</p>
//             <p style="${style.signature}">Daallo Express Cargo</p>
//         `;
//     }

//     return message;
// };

// const generatePDF = async (htmlContent, outputPath) => {
    
//     const Ubuntu = process.env.Ubuntu; 
//     console.log("ubuntu status",Ubuntu);
//     const browserOptions = {
//         headless: true,
//         args: ['--no-sandbox', '--disable-setuid-sandbox']
//     };

//     if (Ubuntu === "true") {
//         console.log("ubuntu machine");
//         browserOptions.executablePath = '/usr/bin/chromium-browser';
//     }
    
    
//     const browser = await puppeteer.launch(browserOptions);
//     const page = await browser.newPage();
//     await page.setContent(htmlContent, { waitUntil: 'load' });
//     await page.pdf({ path: outputPath, format: 'A4' });
//     await browser.close();
// };


// const StatusEmailSender = async (email, name, awb, status, arrival, departure, phone, whatsapp, flightDate, routing, role, bookingDetails) => {
//     console.log("Es", email, name, awb, status, arrival, departure, phone, whatsapp, flightDate, routing);

//     try {
//         const transporter = nodemailer.createTransport({
//             host: 'sg2plzcpnl491722.prod.sin2.secureserver.net',
//             port: 465,
//             secure: true,
//             auth: {
//                 user: 'admin@daallocargo.com',
//                 pass: 'Afnan@2024'
//             }
//         });

//         let awbUrl = '';

//         if (status === 'Booked') {
//             const awbHtml = generateAirWaybillHTML(bookingDetails);
//             const awbFolderPath = path.join(__dirname, 'awbBills');
//             mkdirp.sync(awbFolderPath);
//             const pdfFilePath = path.join(awbFolderPath, `${awb}.pdf`);
            
//             await generatePDF(awbHtml, pdfFilePath);

//             awbUrl = await uploadToCloudinary(pdfFilePath);
//             fs.unlink(pdfFilePath, (err) => {
//                 if (err) {
//                     console.error('Error deleting the file:', err);
//                 } else {
//                     console.log('File successfully deleted');
//                 }
//             });
//         }

//         const templatePath = path.join(__dirname, 'template.html');
//         let emailTemplate = fs.readFileSync(templatePath, 'utf8');
//         const messageContent = loadTemplate(status, name, awb, arrival, departure, awbUrl,flightDate);
//         emailTemplate = emailTemplate.replace('{{message}}', messageContent);

//         const mailOptions = {
//             from: 'daalloairlines@daallocargo.com',
//             to: email,
//             subject: 'Status Update',
//             html: emailTemplate
//         };

//         bookingDetails = [
//             email, name, awb, status, arrival, departure, phone, whatsapp, flightDate, routing, role, awbUrl
//         ];

//         await sendWhatsAppMessage(whatsapp, status, bookingDetails);
//         await transporter.sendMail(mailOptions);
//         console.log('Status update email sent successfully');
//     } catch (error) {
//         if (error.response && error.response.body) {
//             console.error('Error response from server:', error.response.body);
//         } else {
//             console.error('Error sending status update email:', error.message);
//         }
//     }
// };

// module.exports = StatusEmailSender;
