const sql = require('mssql');
const StatusEmailSender = require('./../Utility/StatusEmailSender');

class BookingFormModel {
    constructor(db) {
        this.db = db;
    }

    static BasicQuery = `
    SELECT 
        b.awb AS awb, 
        b.rate, 
        b.paymentTerms, 
        b.totalInputWeight, 
        b.totalVolumetricWeight, 
        b.finalWeight, 
        b.shipper_notes AS shipperNotes, 
        b.packages_count AS packagesCount, 
        b.dangerous_goods_codes AS dangerousGoodsCodes, 
        b.goods_descriptions_codes AS goodsDescriptionsCodes, 
        b.special_handling_codes AS specialHandlingCodes, 
        b.status, 
        b.createdBy, 
        b.createdById, 
        b.userEmail, 
        s.shipper_id AS shipperId, 
        s.name AS shipperName, 
        s.phone AS shipperPhone,
        s.whatsapp AS shipperWhatsapp, 
        s.email AS shipperEmail, 
        s.address AS shipperAddress, 
        s.country AS shipperCountry, 
        s.city AS shipperCity,
        c.consignee_id AS consigneeId, 
        c.name AS consigneeName, 
        c.phone AS consigneePhone, 
        c.whatsapp AS consigneeWhatsapp, 
        c.email AS consigneeEmail, 
        c.address AS consigneeAddress, 
        c.country AS consigneeCountry, 
        c.city AS consigneeCity,
        p.package_id AS packageId, 
        p.booking_id AS packageBookingId, 
        p.length AS packageLength, 
        p.width AS packageWidth, 
        p.height AS packageHeight, 
        p.weight AS packageWeight, 
        p.count AS packageCount, 
        COALESCE(sch.flightName, 'NONE') AS flightName, 
        COALESCE(CONVERT(VARCHAR, sch.Date, 103), '00-00-0000') AS flightDate, 
        rf.RegionName AS fromRegion, 
        rt.RegionName AS toRegion,
        FORMAT(b.created_at, 'dd-MM-yyyy') AS createdDate,
        cr.Rate AS cargoRate, 
        cr.Currency AS cargoRateCurrency,
         CASE 
            WHEN b.masterAwb = 0 THEN b.awb 
            ELSE b.masterAwb 
        END AS masterAwb
    FROM booking b
    INNER JOIN shipper s ON b.shipper_id = s.shipper_id
    INNER JOIN consignee c ON b.consignee_id = c.consignee_id
    INNER JOIN package p ON b.awb = p.booking_id
    INNER JOIN regionConnection rc ON b.routeID = rc.connectionID
    INNER JOIN region rf ON rc.fromRegionID = rf.RegionID
    INNER JOIN region rt ON rc.toRegionID = rt.RegionID
    LEFT JOIN allotment a ON b.awb = a.booking_awb
    LEFT JOIN schedule sch ON a.schedule_scheduleId = sch.ScheduleID
    LEFT JOIN cargorates cr ON b.cargo_rate = cr.CargoRateID
`;


    
    async getActiveBooking(createdById, userEmail) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('createdById', sql.Int, createdById);
            request.input('userEmail', sql.NVarChar, userEmail);
    
            const query = `
                ${BookingFormModel.BasicQuery}    
                WHERE b.createdById = @createdById
                AND b.userEmail = @userEmail
                AND b.status <> 'Delivered'
            `;
            
            const result = await request.query(query);
            return this.groupBookingsByAwb(result.recordset);
        } 
        catch (err) {
            throw new Error('Error fetching active booking: ' + err.message);
        }
    }
    async getAllBooking(createdById, userEmail) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('createdById', sql.Int, createdById);
            request.input('userEmail', sql.NVarChar, userEmail);
    
            const query = `
                ${BookingFormModel.BasicQuery}    
                WHERE b.createdById = @createdById
                AND b.userEmail = @userEmail
            `;
            const result = await request.query(query);

            return this.groupBookingsByAwb(result.recordset);


        } catch (err) {
            throw new Error('Error fetching all bookings: ' + err.message);
        }
    }

    async getBookingByAwb(awb) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('awb', sql.BigInt, awb);    
            
            const query = `
                ${BookingFormModel.BasicQuery}    
                WHERE b.awb = @awb
            `;
              const result = await request.query(query);
        return this.groupBookingsByAwb(result.recordset);

        } catch (err) {
            throw new Error('Error fetching all bookings: ' + err.message);
        }
    }
    
  
    async getBookingsByToId(toId) {
        try {
            const pool = await this.db;
            const request = pool.request();
    
            const query = `
                ${BookingFormModel.BasicQuery}    
                WHERE 
                    rc.toRegionID = @toId
                    AND b.status = 'Arrived' or b.status = 'Delivered'
            `;
            
            const result = await request.input('toId', toId).query(query);

            return this.groupBookingsByAwb(result.recordset);
        } catch (err) {
            throw new Error('Error fetching bookings by toId: ' + err.message);
        }
    }
    
    async getBookingsByRouteID(routeID) {
        try {
            const pool = await this.db;
            const request = pool.request();
    
            const query = `
                ${BookingFormModel.BasicQuery}    
                WHERE 
                    rc.connectionID = @routeID
                    AND b.status IN ('Allocated', 'Unallocated')
            `;
            
            const result = await request.input('routeID', routeID).query(query);

            return this.groupBookingsByAwb(result.recordset);
        } catch (err) {
            throw new Error('Error fetching bookings by routeID: ' + err.message);
        }
    }
    
    
    
    async getTotalBooking() {
        try {
            const pool = await this.db;
            const request = pool.request();
    
            const query = `
              ${BookingFormModel.BasicQuery}    
            `;
            const result = await request.query(query);
            return this.groupBookingsByAwb(result.recordset);


        } catch (err) {
            throw new Error('Error fetching all bookings: ' + err.message);
        }
    }
    
    /////////////////////////////////////////////////////////////////////
    async findOrCreateShipper(transaction, shipperData) {
        try {
            const { name, phone, email, address, country, province, city, whatsapp } = shipperData;
            // console.log("shipper Data", shipperData);
            const request = new sql.Request(transaction);
            request.input('name', sql.NVarChar, name);
            request.input('phone', sql.NVarChar, phone);
            request.input('email', sql.NVarChar, email);
            request.input('address', sql.NVarChar(sql.MAX), address);
            request.input('country', sql.NVarChar, country);
            request.input('province', sql.NVarChar, province);
            request.input('city', sql.NVarChar, city);
            request.input('whatsapp', sql.NVarChar, whatsapp);
    
            const query = `
                MERGE INTO shipper AS target
                USING (VALUES (@name, @phone, @email, @address, @country, @province, @city, @whatsapp)) AS source (name, phone, email, address, country, province, city, whatsapp)
                ON target.name = source.name AND target.phone = source.phone AND target.email = source.email AND target.address = source.address AND target.country = source.country AND target.province = source.province AND target.city = source.city AND target.whatsapp = source.whatsapp
                WHEN NOT MATCHED THEN
                    INSERT (name, phone, email, address, country, province, city, whatsapp)
                    VALUES (source.name, source.phone, source.email, source.address, source.country, source.province, source.city, source.whatsapp);
                SELECT shipper_id FROM shipper WHERE name = @name AND phone = @phone AND email = @email AND address = @address AND country = @country AND province = @province AND city = @city AND whatsapp = @whatsapp;
            `;
    
            const result = await request.query(query);
            return result.recordset[0].shipper_id;
        } catch (err) {
            throw new Error('Error finding/creating shipper: ' + err.message);
        }
    }
    
    async findOrCreateConsignee(transaction, consigneeData) {
        try {
            const { name, phone, email, address, country, province, city, whatsapp } = consigneeData;
            const request = new sql.Request(transaction);
            request.input('name', sql.NVarChar, name);
            request.input('phone', sql.NVarChar, phone);
            request.input('email', sql.NVarChar, email);
            request.input('address', sql.NVarChar(sql.MAX), address);
            request.input('country', sql.NVarChar, country);
            request.input('province', sql.NVarChar, province);
            request.input('city', sql.NVarChar, city);
            request.input('whatsapp', sql.NVarChar, whatsapp);
    
            const query = `
                MERGE INTO consignee AS target
                USING (VALUES (@name, @phone, @email, @address, @country, @province, @city, @whatsapp)) AS source (name, phone, email, address, country, province, city, whatsapp)
                ON target.name = source.name AND target.phone = source.phone AND target.email = source.email AND target.address = source.address AND target.country = source.country AND target.province = source.province AND target.city = source.city AND target.whatsapp = source.whatsapp
                WHEN NOT MATCHED THEN
                    INSERT (name, phone, email, address, country, province, city, whatsapp)
                    VALUES (source.name, source.phone, source.email, source.address, source.country, source.province, source.city, source.whatsapp);
                SELECT consignee_id FROM consignee WHERE name = @name AND phone = @phone AND email = @email AND address = @address AND country = @country AND province = @province AND city = @city AND whatsapp = @whatsapp;
            `;
    
            const result = await request.query(query);
            return result.recordset[0].consignee_id;
        } catch (err) {
            throw new Error('Error finding/creating consignee: ' + err.message);
        }
    }
    
    
    
    groupBookingsByAwb(recordset) {
        const groupedBookings = {};
    
        recordset.forEach(row => {
            const {
                awb, rate, paymentTerms, cargoRate, totalInputWeight,
                totalVolumetricWeight, finalWeight, shipperNotes, packagesCount,
                dangerousGoodsCodes, goodsDescriptionsCodes, specialHandlingCodes,
                status, createdBy, createdById, userEmail, shipperId, shipperName,
                shipperPhone,shipperWhatsapp, shipperEmail, shipperAddress, shipperCountry, shipperCity,
                consigneeId, masterAwb,consigneeName, consigneePhone,consigneeWhatsapp, consigneeEmail, consigneeAddress, consigneeCountry, consigneeCity,
                packageId, packageBookingId, packageLength, packageWidth, packageHeight,
                packageWeight, packageCount, flightName,flightDate, fromRegion, toRegion,
                createdDate
            } = row;
    
            if (!groupedBookings[awb]) {
                groupedBookings[awb] = {
                    awb, rate, paymentTerms, cargoRate, totalInputWeight,
                    totalVolumetricWeight, finalWeight, shipperNotes, packagesCount,
                    dangerousGoodsCodes, goodsDescriptionsCodes, specialHandlingCodes,
                    status, createdBy, createdById, userEmail, shipperId, shipperName,
                    shipperPhone,shipperWhatsapp, shipperEmail, shipperAddress, shipperCountry, shipperCity,
                    consigneeId, masterAwb,consigneeName, consigneePhone,consigneeWhatsapp,consigneeEmail, consigneeAddress, consigneeCountry, consigneeCity,
                    flightName,flightDate, fromRegion, toRegion, createdDate,
                    packages: []
                };
            }
    
            groupedBookings[awb].packages.push({
                packageId, packageBookingId, packageLength, packageWidth,
                packageHeight, packageWeight, packageCount
            });
        });
    
        // Convert groupedBookings object to array
        return Object.values(groupedBookings);
    }
    
    
    async addShipper(shipperData) {
        try {
            const pool = await this.db;
            const transaction = await pool.transaction();
            await transaction.begin();

            try {
                const shipperId = await this.findOrCreateShipper(transaction, shipperData);
                await transaction.commit();
                return shipperId;
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (err) {
            throw new Error('Error adding shipper: ' + err.message);
        }
    }
    async addConsignee(consigneeData) {
        try {
            const pool = await this.db;
            const transaction = await pool.transaction();
            await transaction.begin();

            try {
                const consigneeId = await this.findOrCreateConsignee(transaction, consigneeData);
                await transaction.commit();
                return consigneeId;
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (err) {
            throw new Error('Error adding consignee: ' + err.message);
        }
    }

    async addPackage(packageData) {
        try {
            // console.log("adding package " ,packageData.booking_id);
            const pool = await this.db;
            const request = new sql.Request(pool);
    
            const query = `
                INSERT INTO package (booking_id, length, width, height, weight, count)
                VALUES (@booking_id, @length, @width, @height, @weight, @count);
            `;
    
            request.input('booking_id', sql.BigInt, packageData.booking_id);
            request.input('length', sql.Decimal(10, 2), packageData.length);
            request.input('width', sql.Decimal(10, 2), packageData.width);
            request.input('height', sql.Decimal(10, 2), packageData.height);
            request.input('weight', sql.Decimal(10, 2), packageData.weight);
            request.input('count', sql.Int, packageData.count);
    
            const result = await request.query(query);
            return result.rowsAffected > 0;
        } catch (err) {
            throw new Error('Error adding package: ' + err.message);
        }
    }

    ///////////////////////////////////////////////////////////////////////
    async getBookingStatistics(createdById, userEmail) {
        try {
          const pool = await this.db;
          const request = pool.request();
          request.input('createdById', sql.Int, createdById);
          request.input('userEmail', sql.NVarChar, userEmail);
      
          const query = `
            SELECT
              COUNT(*) AS totalBookings,
              SUM(CASE WHEN b.status = 'Delivered' THEN 1 ELSE 0 END) AS delivered,
              SUM(CASE WHEN b.status <> 'Delivered' THEN 1 ELSE 0 END) AS inTransit
            FROM booking b
            WHERE b.createdById = @createdById
            AND b.userEmail = @userEmail
          `;
          const result = await request.query(query);
          return result.recordset[0]; 
        } catch (err) {
          throw new Error('Error fetching booking statistics: ' + err.message);
        }
      }
   
 
    async updateBookingStatusToDelivered(awb) {
        try {
            const pool = await this.db;
            const transaction = await pool.transaction();
            await transaction.begin();
    
            try {
                // Update the status to 'Delivered'
                const request = new sql.Request(transaction);
                request.input('awb', sql.BigInt, awb);
                request.input('status', sql.NVarChar, 'Delivered');
    
                const query = `
                    UPDATE booking
                    SET status = @status
                    WHERE awb = @awb;
                `;

               
    
                await request.query(query);
                await transaction.commit();
                return true;
            } catch (err) {
                await transaction.rollback();
                throw new Error('Error updating booking status to Delivered: ' + err.message);
            }
        } catch (err) {
            throw new Error('Error updating booking status to Delivered: ' + err.message);
        }
    }

   async getShippersDetails(userEmail, createdById) {
    try {
        // console.log("Getting unique shipper details...");
        const pool = await this.db;
        const request = pool.request();
        request.input('userEmail', sql.NVarChar, userEmail);
        request.input('createdById', sql.Int, createdById);

        const query = `
            SELECT 
                shipper_id, name, phone, email, address, country, city, whatsapp
            FROM (
                SELECT 
                    s.shipper_id, s.name, s.phone, s.email, s.address, s.country, s.city, s.whatsapp,
                    ROW_NUMBER() OVER(PARTITION BY s.name, s.phone ORDER BY s.shipper_id) AS RowNumber
                FROM
                    shipper s
                JOIN
                    booking b ON s.shipper_id = b.shipper_id
                WHERE
                    b.userEmail = @userEmail
                    AND b.createdById = @createdById
            ) AS Subquery
            WHERE RowNumber = 1;
        `;

        const result = await request.query(query);
        return result.recordset;
    } catch (err) {
        throw new Error('Error fetching unique shippers details: ' + err.message);
    }
}


    async getConsigneesDetails(userEmail, createdById) {
        try {
            // console.log("Getting receivers details in model", userEmail, createdById);
            const pool = await this.db;
            const request = pool.request();
            request.input('userEmail', sql.NVarChar, userEmail);
            request.input('createdById', sql.Int, createdById);
    
            const query = `
               SELECT 
                consignee_id, name, phone, email, address, country, city, whatsapp
            FROM (
                SELECT 
                    s.consignee_id, s.name, s.phone, s.email, s.address, s.country, s.city, s.whatsapp,
                    ROW_NUMBER() OVER(PARTITION BY s.name, s.phone ORDER BY s.consignee_id) AS RowNumber
                FROM
                    consignee s
                JOIN
                    booking b ON s.consignee_id = b.consignee_id
                WHERE
                    b.userEmail = @userEmail
                    AND b.createdById = @createdById
            ) AS Subquery
            WHERE RowNumber = 1;
            `;
    
            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            throw new Error('Error fetching consignees details: ' + err.message);
        }
    }

    async getAllCargoCategories() {
        try {
            const pool = await this.db;
            const request = pool.request();
    
            const query = `
                SELECT code, category
                FROM cargo_categories
            `;
            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            throw new Error('Error fetching all cargo categories: ' + err.message);
        }
    }
    async addCargoCategory(code, category) {
        try {
            const pool = await this.db;
            const request = pool.request();
    
            const query = `
                INSERT INTO cargo_categories (code, category)
                VALUES (@code, @category)
            `;
            
            request.input('code', code);
            request.input('category', category);
            
            await request.query(query);
            return { message: 'Cargo category added successfully.' };
        } catch (err) {
            throw new Error('Error adding cargo category: ' + err.message);
        }
    }
    
    async deleteCargoCategory(code) {
        try {
            const pool = await this.db;
            const request = pool.request();
    
            const query = `
                DELETE FROM cargo_categories
                WHERE code = @code
            `;
            
            request.input('code', code);
            
            await request.query(query);
            return { message: 'Cargo category deleted successfully.' };
        } catch (err) {
            throw new Error('Error deleting cargo category: ' + err.message);
        }
    }
    
    async getAllSpecialHandlingCodes() {
        try {
            const pool = await this.db;
            const request = pool.request();
    
            const query = `
                SELECT code, description
                FROM special_handling
            `;
            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            throw new Error('Error fetching all special handling codes: ' + err.message);
        }
    }
    async addSpecialHandlingCode(code, description) {
        try {
            const pool = await this.db;
            const request = pool.request();
    
            const query = `
                INSERT INTO special_handling (code, description)
                VALUES (@code, @description)
            `;
            
            request.input('code', code);
            request.input('description', description);
            
            await request.query(query);
            return { message: 'Special handling code added successfully.' };
        } catch (err) {
            throw new Error('Error adding special handling code: ' + err.message);
        }
    }
    
    async deleteSpecialHandlingCode(code) {
        try {
            const pool = await this.db;
            const request = pool.request();
    
            const query = `
                DELETE FROM special_handling
                WHERE code = @code
            `;
            
            request.input('code', code);
            
            await request.query(query);
            return { message: 'Special handling code deleted successfully.' };
        } catch (err) {
            throw new Error('Error deleting special handling code: ' + err.message);
        }
    }
    

    async getAllDangerousGoods() {
        try {
            // console.log("in model");
            const pool = await this.db;
            const request = pool.request();
    
            const query = `
                SELECT code, description
                FROM dangerous_goods
            `;
            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            throw new Error('Error fetching all Dangerous Goods: ' + err.message);
        }
    }
    async addDangerousGoods(code, description) {
        try {
            const pool = await this.db;
            const request = pool.request();
    
            const query = `
                INSERT INTO dangerous_goods (code, description)
                VALUES (@code, @description)
            `;
            
            request.input('code', code);
            request.input('description', description);
            
            await request.query(query);
            return { message: 'Dangerous goods added successfully.' };
        } catch (err) {
            throw new Error('Error adding dangerous goods: ' + err.message);
        }
    }
    
    async deleteDangerousGoods(code) {
        try {
            const pool = await this.db;
            const request = pool.request();
    
            const query = `
                DELETE FROM dangerous_goods
                WHERE code = @code
            `;
            
            request.input('code', code);
            
            await request.query(query);
            return { message: 'Dangerous goods deleted successfully.' };
        } catch (err) {
            throw new Error('Error deleting dangerous goods: ' + err.message);
        }
    }
    








    async deleteBookingForm(awb) {
        try {
            const pool = await this.db;
            const transaction = pool.transaction();
            await transaction.begin();
            
            try {
                // Fetch the AWB of the booking to be deleted
                const awbRequest = new sql.Request(transaction);
                awbRequest.input('awb', sql.BigInt, awb);
                const awbQuery = 'SELECT awb FROM booking WHERE awb = @awb';
                const awbResult = await awbRequest.query(awbQuery);
                const foundAwb = awbResult.recordset[0];
                
                if (!foundAwb) {
                    throw new Error('AWB not found for the given AWB number');
                }
    
                // Delete from allocation where booking_awb matches
                const deleteAllocationRequest = new sql.Request(transaction);
                deleteAllocationRequest.input('awb', sql.BigInt, awb);
                const deleteAllocationQuery = 'DELETE FROM allotment WHERE booking_awb = @awb';
                await deleteAllocationRequest.query(deleteAllocationQuery);
    
                // Delete from package where booking_id matches
                const deletePackageRequest = new sql.Request(transaction);
                deletePackageRequest.input('awb', sql.BigInt, awb);
                const deletePackageQuery = 'DELETE FROM package WHERE booking_id = @awb';
                await deletePackageRequest.query(deletePackageQuery);
    
                // Delete from booking where booking_id matches
                const deleteBookingRequest = new sql.Request(transaction);
                deleteBookingRequest.input('awb', sql.BigInt, awb);
                const deleteBookingQuery = 'DELETE FROM booking WHERE awb = @awb';
                await deleteBookingRequest.query(deleteBookingQuery);
    
                await transaction.commit();
                return true;
            } catch (err) {
                await transaction.rollback();
                throw new Error('Error deleting booking form: ' + err.message);
            }
        } catch (err) {
            throw new Error('Error deleting booking form: ' + err.message);
        }
    }
    async getBookingDetailsByAwb(awb) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('awb', sql.NVarChar, awb);
            
            const query = `
                SELECT 
                    b.status,
                    b.awb,
                    s.name AS shipperName, 
                    s.phone AS shipperPhone, 
                    s.whatsapp AS shipperWhatsApp, 
                    s.email AS shipperEmail, 
                    s.address AS shipperAddress, 
                    c.name AS consigneeName, 
                    c.phone AS consigneePhone, 
                    C.whatsapp AS consigneeWhatsApp, 
                    c.email AS consigneeEmail, 
                    c.address AS consigneeAddress,
                    rf.RegionName AS fromRegion,
                    rt.RegionName AS toRegion
                FROM booking b
                INNER JOIN shipper s ON b.shipper_id = s.shipper_id
                INNER JOIN consignee c ON b.consignee_id = c.consignee_id
                INNER JOIN regionConnection rc ON b.routeID = rc.connectionID
                INNER JOIN region rf ON rc.fromRegionID = rf.RegionID
                INNER JOIN region rt ON rc.toRegionID = rt.RegionID
                WHERE b.awb = @awb
            `;
            
            const result = await request.query(query);
            
            if (result.recordset.length === 0) {
                throw new Error('No booking found with the provided AWB.');
            }
            
            const row = result.recordset[0];
            
            const bookingDetails = {
                status: row.status,
                awb:row.awb,
                shipper: {
                    name: row.shipperName,
                    phone: row.shipperPhone,
                    whatsapp: row.shipperWhatsApp,
                    email: row.shipperEmail,
                    address: row.shipperAddress
                },
                consignee: {
                    name: row.consigneeName,
                    phone: row.consigneePhone,
                    whatsapp: row.consigneeWhatsApp,
                    email: row.consigneeEmail,
                    address: row.consigneeAddress
                },
                from: row.fromRegion,
                to: row.toRegion
            };
            
            // console.log("bookingDetails", bookingDetails);
            
            return bookingDetails;
        } catch (err) {
            throw new Error('Error fetching booking details: ' + err.message);
        }
    }
    
    async addBooking(bookingData) {
        try {
            const pool = await this.db;
            const transaction = await pool.transaction();
            await transaction.begin();
    
            try {
                // Insert into booking table
                const request = new sql.Request(transaction);
                request.input('rate', sql.NVarChar, bookingData.rate);
                request.input('paymentTerms', sql.NVarChar, bookingData.paymentTerms);
                request.input('dummy', sql.NVarChar, bookingData.dummy);
                request.input('routeID', sql.Int, bookingData.connectionid);
                request.input('cargoRateId', sql.Int, bookingData.cargoRateId);
                request.input('totalInputWeight', sql.Decimal(10, 2), bookingData.totalInputWeight);
                request.input('totalVolumetricWeight', sql.Decimal(10, 2), bookingData.totalVolumetricWeight);
                request.input('finalWeight', sql.Decimal(10, 2), bookingData.finalWeight);
                request.input('shipper_notes', sql.Text, bookingData.shipper_notes);
                request.input('packages_count', sql.Int, bookingData.packages_count);
                request.input('dangerous_goods_codes', sql.NVarChar, bookingData.dangerous_goods_codes);
                request.input('goods_descriptions_codes', sql.NVarChar, bookingData.goods_descriptions_codes);
                request.input('special_handling_codes', sql.NVarChar, bookingData.special_handling_codes);
                request.input('status', sql.NVarChar, 'Unallocated');
                request.input('createdBy', sql.NVarChar, bookingData.createdBy);
                request.input('createdById', sql.NVarChar, bookingData.createdById.toString());
                request.input('userEmail', sql.NVarChar, bookingData.userEmail);
                request.input('shipper_id', sql.Int, bookingData.shipper_id);
                request.input('consignee_id', sql.Int, bookingData.receiver_id);
    
                const query = `
                    INSERT INTO booking (
                        rate, paymentTerms, routeID, cargo_rate, totalInputWeight, totalVolumetricWeight, finalWeight, 
                        shipper_notes, packages_count, dangerous_goods_codes, goods_descriptions_codes, special_handling_codes, 
                        status, createdBy, createdById, userEmail,dummy, shipper_id, consignee_id
                    )
                    OUTPUT INSERTED.awb
                    VALUES (
                        @rate, @paymentTerms, @routeID, @cargoRateId, @totalInputWeight, @totalVolumetricWeight, @finalWeight, 
                        @shipper_notes, @packages_count, @dangerous_goods_codes, @goods_descriptions_codes, @special_handling_codes, 
                        @status, @createdBy, @createdById, @userEmail,@dummy, @shipper_id, @consignee_id
                    );
                `;
    
                const result = await request.query(query);
                await transaction.commit();
    
                if (result.recordset.length > 0) 
                {
                      return result.recordset[0].awb;
                } 
                else 
                {
                    throw new Error('Error creating booking: No records inserted');
                }
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (err) {
            throw new Error('Error adding booking: ' + err.message);
        }
    }
    async addMasterAwb(masterAwb, awbs) {
        console.log('adding master awb: ' + masterAwb, awbs);
        const transaction = new sql.Transaction(this.db);
        try {
            await transaction.begin();

            for (const [index, awb] of awbs.entries()) {
                const request = new sql.Request(transaction);
                request.input('masterAwb', sql.BigInt, masterAwb);
                request.input(`awb_${index}`, sql.BigInt, awb);
                await request.query(`UPDATE Booking SET masterAwb = @masterAwb WHERE awb = @awb_${index}`);
            }

            await transaction.commit();
            return { success: true };
        } catch (error) {
            await transaction.rollback();
            console.error('Error adding master AWB:', error);
            throw new Error('Failed to add master AWB');
        }
    }
    
}

module.exports = BookingFormModel;
