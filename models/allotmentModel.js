const sql = require('mssql');

class AllotmentModel {
    constructor(db) {
        this.db = db;
    }

    async allocateBooking(bookingAwb, scheduleId) {
        try {
            const pool = await this.db;
            const request = pool.request();

            // Begin a transaction to ensure atomicity
            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            try {
                // Step 1: Update booking status to 'Allocated'
                const updateBookingQuery = `
                    UPDATE booking
                    SET status = 'Allocated'
                    WHERE awb = @bookingAwb;
                `;
                request.input('bookingAwb', sql.BigInt, bookingAwb);
                await request.query(updateBookingQuery);

                // Step 2: Allocate booking in allotment table
                const insertAllotmentQuery = `
                    INSERT INTO allotment (booking_awb, schedule_scheduleId)
                    VALUES (@bookingAwb, @scheduleId);
                `;
                request.input('scheduleId', sql.BigInt, scheduleId);
                const result = await request.query(insertAllotmentQuery);

                // Commit transaction if everything succeeded
                await transaction.commit();

                return result.rowsAffected > 0;
            } catch (err) {
                // Rollback transaction if there's an error
                await transaction.rollback();
                throw err;
            }
        } catch (err) {
            throw new Error('Error allocating booking: ' + err.message);
        }
    }

    async deallocateBooking(scheduleId, awb) {
        try {
            const pool = await this.db;
            const request = pool.request();
    
            // Begin a transaction to ensure atomicity
            const transaction = new sql.Transaction(pool);
            await transaction.begin();
    
            try {
                // Step 1: Retrieve finalWeight of the booking
                const getBookingFinalWeightQuery = `
                    SELECT finalWeight
                    FROM booking
                    WHERE awb = @awb;
                `;
                request.input('awb', sql.BigInt, awb);
                const { recordset } = await request.query(getBookingFinalWeightQuery);
                if (recordset.length === 0) {
                    throw new Error(`Booking with AWB ${awb} not found.`);
                }
                const finalWeight = recordset[0].finalWeight;
    
                // Step 2: Update booking status to 'Unallocated'
                const updateBookingQuery = `
                    UPDATE booking
                    SET status = 'Unallocated'
                    WHERE awb = @awb;
                `;
                await request.query(updateBookingQuery);
    
                // Step 3: Deallocate booking in allotment table
                const deleteAllotmentQuery = `
                    DELETE FROM allotment
                    WHERE booking_awb = @awb AND schedule_scheduleId = @scheduleId;
                `;
                request.input('scheduleId', sql.BigInt, scheduleId);
                await request.query(deleteAllotmentQuery);
    
                // Step 4: Update schedule usedCapacity
                const updateScheduleUsedCapacityQuery = `
                    UPDATE schedule
                    SET usedCapacity = usedCapacity - @finalWeight
                    WHERE ScheduleID = @scheduleId;
                `;
                request.input('finalWeight', sql.Decimal(10, 2), finalWeight);
                await request.query(updateScheduleUsedCapacityQuery);
    
                // Commit transaction if everything succeeded
                await transaction.commit();
    
                return true;
            } catch (err) {
                // Rollback transaction if there's an error
                await transaction.rollback();
                throw err;
            }
        } catch (err) {
            throw new Error('Error deallocating booking: ' + err.message);
        }
    }
    
    async updateScheduleStatusToDeparted(scheduleId, masterAwb) {
        try {
            const pool = await this.db;
            const request = pool.request();
            // console.log(scheduleId, masterAwb, "request");
    
            // Begin a transaction to ensure atomicity
            const transaction = new sql.Transaction(pool);
            await transaction.begin();
    
            let awbs = []; // Array to store booking AWBs
    
            try {
                // Step 1: Select booking AWBs associated with the schedule
                const selectAWBsQuery = `
                    SELECT b.awb
                    FROM booking b
                    INNER JOIN allotment a ON b.awb = a.booking_awb
                    WHERE a.schedule_scheduleId = @scheduleId;
                `;
                request.input('scheduleId', sql.BigInt, scheduleId);
                const awbsResult = await request.query(selectAWBsQuery);
                awbs = awbsResult.recordset.map(row => row.awb);
    
                // Step 2: Update schedule status to 'Departed'
                const updateScheduleQuery = `
                    UPDATE schedule
                    SET status = 'Departed', masterAwb = @masterAwb
                    WHERE ScheduleID = @scheduleId;
                `;
                request.input('masterAwb', sql.BigInt, masterAwb);
                await request.query(updateScheduleQuery);
    
                // Step 3: Update booking status to 'Departed'
                const updateBookingQuery = `
                    UPDATE booking
                    SET status = 'Departed'
                    FROM booking b
                    INNER JOIN allotment a ON b.awb = a.booking_awb
                    WHERE a.schedule_scheduleId = @scheduleId;
                `;
                await request.query(updateBookingQuery);
    
                await transaction.commit();
    
                return { success: true, awbs };
            } catch (err) {
                await transaction.rollback();
                throw err;
            }
        } catch (err) {
            throw new Error('Error updating schedule status to Departed: ' + err.message);
        }
    }
    
    async updateScheduleStatusToArrived(scheduleId) {
        try {
            const pool = await this.db;
            const request = pool.request();
    
            // Begin a transaction to ensure atomicity
            const transaction = new sql.Transaction(pool);
            await transaction.begin();
    
            let awbs = []; // Array to store booking AWBs
    
            try {
                // Step 1: Select booking AWBs associated with the schedule
                const selectAWBsQuery = `
                    SELECT b.awb
                    FROM booking b
                    INNER JOIN allotment a ON b.awb = a.booking_awb
                    WHERE a.schedule_scheduleId = @scheduleId;
                `;
                request.input('scheduleId', sql.BigInt, scheduleId);
                const awbsResult = await request.query(selectAWBsQuery);
                awbs = awbsResult.recordset.map(row => row.awb);
    
                // Step 2: Update schedule status to 'Arrived'
                const updateScheduleQuery = `
                    UPDATE schedule
                    SET status = 'Arrived'
                    WHERE ScheduleID = @scheduleId;
                `;
                await request.query(updateScheduleQuery);
    
                // Step 3: Update booking status to 'Arrived'
                const updateBookingQuery = `
                    UPDATE booking
                    SET status = 'Arrived'
                    FROM booking b
                    INNER JOIN allotment a ON b.awb = a.booking_awb
                    WHERE a.schedule_scheduleId = @scheduleId;
                `;
                await request.query(updateBookingQuery);
    
                // Commit transaction if everything succeeded
                await transaction.commit();
    
                return { success: true, awbs };
            } catch (err) {
                // Rollback transaction if there's an error
                await transaction.rollback();
                throw err;
            }
        } catch (err) {
            throw new Error('Error updating schedule status to Arrived: ' + err.message);
        }
    }
    
    




    async updateScheduleUsedCapacity(scheduleId, newUsedCapacity) {
        try {
            // console.log("Updating capacity",scheduleId,newUsedCapacity);
            const pool = await this.db;
            const request = pool.request();
            const query = `
                UPDATE schedule
                SET usedCapacity = usedCapacity + @newUsedCapacity
                WHERE ScheduleID = @scheduleId
            `;
            
            request.input('scheduleId', scheduleId);
            request.input('newUsedCapacity', newUsedCapacity);
    
            const result = await request.query(query);
            // console.log(`Updated usedCapacity for schedule ID ${scheduleId}.`);
            return true;
        } catch (err) {
            console.error('Error updating schedule used capacity:', err);
            return false;
        }
    }
    async updateBookings(bookings) {
        
        try {
            const pool = await this.db;
            const transaction = new sql.Transaction(pool);
            await transaction.begin();
            
            try {
                // Iterate over bookings and prepare a new request for each booking
                for (const [index, booking] of bookings.entries()) {
                    const { awb, amountPaid, balance, remarks } = booking;
    
                    // Skip updating if amountPaid is null or undefined
                    if (amountPaid == null) {
                        console.warn(`Skipping AWB ${awb} due to null amountPaid`);
                        continue;
                    }
    
                    // Create a new request for each booking
                    const request = transaction.request();
    
                    // Prepare update query with unique parameter names
                    const updateQuery = `
                        UPDATE booking
                        SET amountPaid = @amountPaid_${index}, balance = @balance_${index}, remarks = @remarks_${index}
                        WHERE awb = @awb_${index};
                    `;
    
                    request.input(`amountPaid_${index}`, sql.Decimal(10, 2), amountPaid);
                    request.input(`balance_${index}`, sql.Decimal(10, 2), balance);
                    request.input(`remarks_${index}`, sql.NVarChar, remarks);
                    request.input(`awb_${index}`, sql.NVarChar, awb);
    
                    await request.query(updateQuery);
                }
    
                // Commit transaction if everything succeeded
                await transaction.commit();
                return true;
            } catch (err) {
                // Rollback transaction if there's an error
                await transaction.rollback();
                throw err;
            }
        } catch (err) {
            throw new Error('Error updating bookings: ' + err.message);
        }
    }
    
    
    
 

    async getAllocatedBookings(scheduleId) {
        try {
            const pool = await this.db;
            const request = pool.request();

            const query = `
                SELECT a.*, b.*
                FROM allotment a
                INNER JOIN booking b ON a.booking_awb = b.awb
                WHERE a.schedule_scheduleId = @scheduleId;
            `;

            request.input('scheduleId', sql.BigInt, scheduleId);

            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            throw new Error('Error fetching allocated bookings: ' + err.message);
        }
    }

    async getAllAllocations() {
        try {
            const pool = await this.db;
            const request = pool.request();

            const query = `
                SELECT a.*, b.*, s.*
                FROM allotment a
                INNER JOIN booking b ON a.booking_awb = b.awb
                INNER JOIN schedule s ON a.schedule_scheduleId = s.ScheduleID;
            `;

            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            throw new Error('Error fetching all allocations: ' + err.message);
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
}


module.exports = AllotmentModel;
