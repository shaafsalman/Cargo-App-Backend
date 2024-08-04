const cloudinary = require('./cloudinaryConfig');
const path = require('path'); // Import the 'path' module
const fs = require('fs');

async function uploadToCloudinary(filePath) {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
            folder: "AwbBills",
            public_id: path.basename(filePath, path.extname(filePath)),
            overwrite: true,
            type: "upload",
            access_mode: "public" 
        });

        return result.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
}

module.exports = uploadToCloudinary;
