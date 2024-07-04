const sql = require('mssql');

class BookingFormModel {
    constructor(db) {
        this.db = db;
    }
    async addBookingForm(bookingFormData) {
        console.log("in booking form model");
    
        const {
            from,
            to,
            cargoRate,
            packages,
            length,
            width,
            height,
            weight,
            shipperNotes,
            shipperName,
            shipperPhone,
            shipperEmail,
            shipperAddress,
      
            receiverName,
            receiverPhone,
            receiverEmail,
            receiverAddress,
          
            createdBy,
            createdById,
            userEmail
        } = bookingFormData;

        console.log("Booking Form data: " + bookingFormData);
    
        try {
            const pool = await this.db;
            const transaction = await pool.transaction();
            await transaction.begin();
    
            try {
                // Insert into locations (if not exists) and get location_ids
                const fromLocationId = await this.findOrCreateLocation(transaction, from);
                const toLocationId = await this.findOrCreateLocation(transaction, to);
    
                // Insert shipper (if not exists) and get shipper_id
                const shipperData = {
                    name: shipperName,
                    phone: shipperPhone,
                    email: shipperEmail,
                    address: shipperAddress
                };
                const shipperId = await this.findOrCreateShipper(transaction, shipperData);
    
                // Insert receiver (if not exists) and get receiver_id
                const receiverData = {
                    name: receiverName,
                    phone: receiverPhone,
                    email: receiverEmail,
                    address: receiverAddress
                };
                const receiverId = await this.findOrCreateReceiver(transaction, receiverData);
    
                // Get the current maximum AWB and increment it by 1
                const requestMaxAWB = new sql.Request(transaction);
                const maxAWBQuery = 'SELECT MAX(CAST(awb AS BIGINT)) AS max_awb FROM booking';
                const maxAWBResult = await requestMaxAWB.query(maxAWBQuery);
                let newAWB = 1; // Default AWB value if no records exist
    
                if (maxAWBResult.recordset.length > 0 && maxAWBResult.recordset[0].max_awb !== null) {
                    newAWB = parseInt(maxAWBResult.recordset[0].max_awb) + 1;
                }
    
                // Calculate volume
                const volume = (length * width * height).toFixed(2);
    
                // Insert into booking table
                const request = new sql.Request(transaction);
                request.input('from_location', sql.NVarChar, from);
                request.input('to_location', sql.NVarChar, to);
                request.input('cargo_rate', sql.NVarChar, cargoRate);
                request.input('packages', sql.Int, packages);
                request.input('length', sql.Decimal(10, 2), length);
                request.input('width', sql.Decimal(10, 2), width);
                request.input('height', sql.Decimal(10, 2), height);
                request.input('volume', sql.Decimal(10, 2), volume);
                request.input('weight', sql.Decimal(10, 2), weight);
                request.input('awb', sql.NVarChar, newAWB.toString());
                request.input('shipper_notes', sql.Text, shipperNotes);
                request.input('shipper_id', sql.Int, shipperId);
                request.input('receiver_id', sql.Int, receiverId);
                request.input('createdBy', sql.NVarChar, createdBy);
                request.input('createdById', sql.Int, createdById); 
                request.input('userEmail', sql.NVarChar, userEmail);
    
                const query = `
                    INSERT INTO booking (from_location, to_location, cargo_rate, packages, length, width, height,volume, weight, awb, shipper_notes, shipper_id, receiver_id, status, createdBy, createdById, userEmail)
                    OUTPUT INSERTED.booking_id
                    VALUES (@from_location, @to_location, @cargo_rate, @packages, @length, @width, @height,@volume, @weight, @awb, @shipper_notes, @shipper_id, @receiver_id, 'Pending', @createdBy, @createdById, @userEmail)
                `;
    
                const result = await request.query(query);
                await transaction.commit();
    
                if (result.recordset.length > 0) {
                    console.log("Booking saved");
                    return true;
                } else {
                    throw new Error('Error creating booking: No records inserted');
                }
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (err) {
            console.error('Error adding booking:', err.message);
            throw new Error('Error adding booking: ' + err.message);
        }
    }
    
    
    
    async getBookingFormById(bookingId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('bookingId', sql.Int, bookingId);
            const query = `
                SELECT b.booking_id, b.from_location, b.to_location, b.cargo_rate, b.packages, b.dimensions, b.weight, b.awb, b.shipper_notes, b.status,
                    s.name as shipper_name, s.phone as shipper_phone, s.email as shipper_email, s.address as shipper_address,
                    r.name as receiver_name, r.phone as receiver_phone, r.email as receiver_email, r.address as receiver_address
                FROM booking b
                INNER JOIN shipper s ON b.shipper_id = s.shipper_id
                INNER JOIN receiver r ON b.receiver_id = r.receiver_id
                WHERE b.booking_id = @bookingId
            `;
            const result = await request.query(query);
            return result.recordset[0];
        } catch (err) {
            throw new Error('Error fetching booking form by ID: ' + err.message);
        }
    }

    async deleteBookingForm(bookingId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('bookingId', sql.Int, bookingId);
            const query = 'DELETE FROM booking WHERE booking_id = @bookingId';
            const result = await request.query(query);
            return result.rowsAffected > 0;
        } catch (err) {
            throw new Error('Error deleting booking form: ' + err.message);
        }
    }

    async findOrCreateLocation(transaction, locationName) {
        try {
            const request = new sql.Request(transaction);
            request.input('locationName', sql.NVarChar, locationName);

            const query = `
                MERGE INTO locations AS target
                USING (VALUES (@locationName)) AS source (location_name)
                ON target.location_name = source.location_name
                WHEN NOT MATCHED THEN
                    INSERT (location_name, country, province, city, address)
                    VALUES (source.location_name, '', '', '', '');
                
                SELECT location_id FROM locations WHERE location_name = @locationName;
            `;

            const result = await request.query(query);
            return result.recordset[0].location_id;
        } catch (err) {
            throw new Error('Error finding/creating location: ' + err.message);
        }
    }

    async findOrCreateShipper(transaction, shipperData) {
        try {
            const { name, phone, email, address, country, province, city } = shipperData;
            const request = new sql.Request(transaction);
            request.input('name', sql.NVarChar, name);
            request.input('phone', sql.NVarChar, phone);
            request.input('email', sql.NVarChar, email);
            request.input('address', sql.Text, address);
            request.input('country', sql.NVarChar, country);
            request.input('province', sql.NVarChar, province);
            request.input('city', sql.NVarChar, city);

            const query = `
                MERGE INTO shipper AS target
                USING (VALUES (@name, @phone, @email, @address, @country, @province, @city)) AS source (name, phone, email, address, country, province, city)
                ON target.name = source.name
                WHEN NOT MATCHED THEN
                    INSERT (name, phone, email, address, country, province, city)
                    VALUES (source.name, source.phone, source.email, source.address, source.country, source.province, source.city);
            `;
            await request.query(query);

            // Retrieve shipper_id
            const selectQuery = 'SELECT shipper_id FROM shipper WHERE name = @name';
            const result = await request.query(selectQuery);
            return result.recordset[0].shipper_id;
        } catch (err) {
            throw new Error('Error finding/creating shipper: ' + err.message);
        }
    }

    async findOrCreateReceiver(transaction, receiverData) {
        try {
            const { name, phone, email, address, country, province, city } = receiverData;
            const request = new sql.Request(transaction);
            request.input('name', sql.NVarChar, name);
            request.input('phone', sql.NVarChar, phone);
            request.input('email', sql.NVarChar, email);
            request.input('address', sql.Text, address);
            request.input('country', sql.NVarChar, country);
            request.input('province', sql.NVarChar, province);
            request.input('city', sql.NVarChar, city);

            const query = `
                MERGE INTO receiver AS target
                USING (VALUES (@name, @phone, @email, @address, @country, @province, @city)) AS source (name, phone, email, address, country, province, city)
                ON target.name = source.name
                WHEN NOT MATCHED THEN
                    INSERT (name, phone, email, address, country, province, city)
                    VALUES (source.name, source.phone, source.email, source.address);
            `;
            await request.query(query);

            // Retrieve receiver_id
            const selectQuery = 'SELECT receiver_id FROM receiver WHERE name = @name';
            const result = await request.query(selectQuery);
            return result.recordset[0].receiver_id;
        } catch (err) {
            throw new Error('Error finding/creating receiver: ' + err.message);
        }
    }
    async getActivebooking(createdById, userEmail) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('createdById', sql.Int, createdById);
            request.input('userEmail', sql.NVarChar, userEmail);
    
            const query = `
                SELECT booking_id, from_location, to_location, cargo_rate, packages, length, width, height, volume, weight, awb, shipper_notes, status
                FROM booking
                WHERE createdById = @createdById
                AND userEmail = @userEmail
                AND status <> 'Delivered'
            `;
            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            throw new Error('Error fetching active booking: ' + err.message);
        }
    }
    async getAllbooking(createdById, userEmail) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('createdById', sql.Int, createdById);
            request.input('userEmail', sql.NVarChar, userEmail);
    
            const query = `
                SELECT booking_id, from_location, to_location, cargo_rate, packages, length, width, height, volume, weight, awb, shipper_notes, status
                FROM booking
                WHERE createdById = @createdById
                AND userEmail = @userEmail
            `;
            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            throw new Error('Error fetching all booking: ' + err.message);
        }
    }
    
    
}

module.exports = BookingFormModel;
