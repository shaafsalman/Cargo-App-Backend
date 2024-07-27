const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class PDFGenerator {
  static async generatePDF(bookingDetails) {
    return new Promise((resolve, reject) => {
      const pdfDir = path.join(__dirname, 'pdfs');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      const doc = new PDFDocument();
      const fileName = `${uuidv4()}.pdf`;
      const filePath = path.join(pdfDir, fileName);

      doc.pipe(fs.createWriteStream(filePath));

      doc.fontSize(16).text('Air Waybill', { align: 'center' });
      doc.text(`AWB: ${bookingDetails.awb}`);
      doc.text(`Consignee Name: ${bookingDetails.consigneeName}`);
      doc.text(`Shipper Name: ${bookingDetails.shipperName}`);
      doc.text(`From Region: ${bookingDetails.fromRegion}`);
      doc.text(`To Region: ${bookingDetails.toRegion}`);
      doc.text(`Created Date: ${bookingDetails.createdDate}`);

      doc.end();

      doc.on('finish', () => {
        const pdfURL = `Utility/pdfs/${fileName}`;
        resolve(pdfURL);
      });

      doc.on('error', (err) => {
        reject(err);
      });
    });
  }
}

module.exports = PDFGenerator;
