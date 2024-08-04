const sql = require('mssql');

class ReportModel {
    constructor(db) {
        this.db = db;
    }

    async getAllBookings(customerID= null, bookingDateFrom= null, bookingDateTo= null, routeID= null, status= null, flight= null, flightDate= null) {
        try {
            const pool = await this.db;
            const request = pool.request();
    
            // Input parameters with null defaults
            request.input('companyID', sql.Int, customerID || null);
            request.input('fromDate', sql.Date, bookingDateFrom || null);
            request.input('toDate', sql.Date, bookingDateTo || null);
            request.input('connectionID', sql.Int, routeID || null);
            request.input('status', sql.NVarChar, status === 'All' ? null : status || null);
            request.input('flightName', sql.NVarChar, flight || null);
            request.input('flightDate', sql.Date, flightDate || null);
    
            // SQL query with conditional filtering
            const query = `
                SELECT 
                    b.awb AS awb, b.rate, b.paymentTerms, b.cargo_rate AS cargoRate, 
                    b.totalInputWeight, b.totalVolumetricWeight, b.finalWeight, 
                    b.shipper_notes AS shipperNotes, b.packages_count AS packagesCount, 
                    b.dangerous_goods_codes AS dangerousGoodsCodes, 
                    b.goods_descriptions_codes AS goodsDescriptionsCodes, 
                    b.special_handling_codes AS specialHandlingCodes, b.status, 
                    b.createdBy, b.createdById, b.userEmail, 
                    s.shipper_id AS shipperId, s.name AS shipperName, 
                    s.phone AS shipperPhone, s.email AS shipperEmail, 
                    s.address AS shipperAddress, 
                    c.consignee_id AS consigneeId, c.name AS consigneeName, 
                    c.phone AS consigneePhone, c.email AS consigneeEmail, 
                    c.address AS consigneeAddress, 
                    p.package_id AS packageId, p.booking_id AS packageBookingId, 
                    p.length AS packageLength, p.width AS packageWidth, 
                    p.height AS packageHeight, p.weight AS packageWeight, 
                    p.count AS packageCount, 
                    COALESCE(sch.flightName, 'NONE') AS flightName, 
                    COALESCE(CONVERT(VARCHAR, sch.Date, 103), '00-00-0000') AS flightDate, 
                    rf.RegionName AS fromRegion, rt.RegionName AS toRegion,
                    FORMAT(b.created_at, 'dd-MM-yyyy') AS createdDate
                FROM booking b
                INNER JOIN shipper s ON b.shipper_id = s.shipper_id
                INNER JOIN consignee c ON b.consignee_id = c.consignee_id
                INNER JOIN package p ON b.awb = p.booking_id
                INNER JOIN regionConnection rc ON b.routeID = rc.connectionID
                INNER JOIN region rf ON rc.fromRegionID = rf.RegionID
                INNER JOIN region rt ON rc.toRegionID = rt.RegionID
                LEFT JOIN allotment a ON b.awb = a.booking_awb
                LEFT JOIN schedule sch ON a.schedule_scheduleId = sch.ScheduleID
                WHERE (@companyID IS NULL OR b.createdById IN (
                    SELECT PersonID FROM companyPerson WHERE companyID = @companyID
                ))
                AND (@fromDate IS NULL OR b.created_at >= @fromDate)
                AND (@toDate IS NULL OR b.created_at <= @toDate)
                AND (@connectionID IS NULL OR b.routeID = @connectionID)
                AND ((@status IS NULL AND b.status <> 'Allocated') OR b.status = @status)
                AND (@flightName IS NULL OR sch.flightName = @flightName)
                AND (@flightDate IS NULL OR sch.Date = @flightDate)
            `;
    
            const result = await request.query(query);
    
            // Process result to group packages by AWB
            const groupedBookings = {};
    
            result.recordset.forEach(row => {
                const {
                    awb, rate, paymentTerms, cargoRate, totalInputWeight,
                    totalVolumetricWeight, finalWeight, shipperNotes, packagesCount,
                    dangerousGoodsCodes, goodsDescriptionsCodes, specialHandlingCodes,
                    status, createdBy, createdById, userEmail, shipperId, shipperName,
                    shipperPhone, shipperEmail, shipperAddress, consigneeId, consigneeName,
                    consigneePhone, consigneeEmail, consigneeAddress, packageId,
                    packageBookingId, packageLength, packageWidth, packageHeight,
                    packageWeight, packageCount, flightName, flightDate, fromRegion, toRegion,
                    createdDate
                } = row;
    
                // Set flightName to "NONE" if status is "Unallocated"
                const finalFlightName = status === 'Unallocated' ? 'NONE' : flightName;
    
                if (!groupedBookings[awb]) {
                    groupedBookings[awb] = {
                        awb, rate, paymentTerms, cargoRate, totalInputWeight,
                        totalVolumetricWeight, finalWeight, shipperNotes, packagesCount,
                        dangerousGoodsCodes, goodsDescriptionsCodes, specialHandlingCodes,
                        status, createdBy, createdById, userEmail, shipperId, shipperName,
                        shipperPhone, shipperEmail, shipperAddress, consigneeId, consigneeName,
                        consigneePhone, consigneeEmail, consigneeAddress, flightName: finalFlightName,
                        flightDate,
                        fromRegion, toRegion, createdDate,
                        packages: []
                    };
                }
    
                groupedBookings[awb].packages.push({
                    packageId, packageBookingId, packageLength, packageWidth,
                    packageHeight, packageWeight, packageCount
                });
            });
    
            // Convert groupedBookings object to array
            const bookings = Object.values(groupedBookings);
    
            return bookings;
        } catch (err) {
            throw new Error('Error fetching all bookings: ' + err.message);
        }
    }
    
    
    

    async getAllCustomers(customerID= null, bookingDateFrom= null, bookingDateTo= null,status= null,) {
        try {
            const pool = await this.db;
            const request = pool.request();

            console.log("model",customerID, bookingDateFrom, bookingDateTo,status)
    
            // Input parameters with null defaults
            request.input('companyID', sql.Int, customerID || null);
            request.input('fromDate', sql.Date, bookingDateFrom || null);
            request.input('toDate', sql.Date, bookingDateTo || null);
            request.input('status', sql.NVarChar, status === 'All' ? null : status || null);

    
            // SQL query with conditional filtering
            const query = `
                SELECT 
                    b.awb AS awb, b.rate, b.paymentTerms, b.cargo_rate AS cargoRate, 
                    b.totalInputWeight, b.totalVolumetricWeight, b.finalWeight, 
                    b.shipper_notes AS shipperNotes, b.packages_count AS packagesCount, 
                    b.dangerous_goods_codes AS dangerousGoodsCodes, 
                    b.goods_descriptions_codes AS goodsDescriptionsCodes, 
                    b.special_handling_codes AS specialHandlingCodes, b.status, 
                    b.createdBy, b.createdById, b.userEmail, 
                    s.shipper_id AS shipperId, s.name AS shipperName, 
                    s.phone AS shipperPhone, s.email AS shipperEmail, 
                    s.address AS shipperAddress, 
                    c.consignee_id AS consigneeId, c.name AS consigneeName, 
                    c.phone AS consigneePhone, c.email AS consigneeEmail, 
                    c.address AS consigneeAddress, 
                    p.package_id AS packageId, p.booking_id AS packageBookingId, 
                    p.length AS packageLength, p.width AS packageWidth, 
                    p.height AS packageHeight, p.weight AS packageWeight, 
                    p.count AS packageCount, 
                    COALESCE(sch.flightName, 'NONE') AS flightName, 
                    COALESCE(CONVERT(VARCHAR, sch.Date, 103), '00-00-0000') AS flightDate, 
                    rf.RegionName AS fromRegion, rt.RegionName AS toRegion,
                    FORMAT(b.created_at, 'dd-MM-yyyy') AS createdDate
                FROM booking b
                INNER JOIN shipper s ON b.shipper_id = s.shipper_id
                INNER JOIN consignee c ON b.consignee_id = c.consignee_id
                INNER JOIN package p ON b.awb = p.booking_id
                INNER JOIN regionConnection rc ON b.routeID = rc.connectionID
                INNER JOIN region rf ON rc.fromRegionID = rf.RegionID
                INNER JOIN region rt ON rc.toRegionID = rt.RegionID
                LEFT JOIN allotment a ON b.awb = a.booking_awb
                LEFT JOIN schedule sch ON a.schedule_scheduleId = sch.ScheduleID
                WHERE (@companyID IS NULL OR b.createdById IN (
                    SELECT PersonID FROM companyPerson WHERE companyID = @companyID
                ))
                AND ((@status IS NULL AND b.status <> 'Allocated') OR b.status = @status)
                AND (@fromDate IS NULL OR b.created_at >= @fromDate)
                AND (@toDate IS NULL OR b.created_at <= @toDate)
            `;
    
            const result = await request.query(query);
    
            // Process result to group packages by AWB
            const groupedBookings = {};
    
            result.recordset.forEach(row => {
                const {
                    awb, rate, paymentTerms, cargoRate, totalInputWeight,
                    totalVolumetricWeight, finalWeight, shipperNotes, packagesCount,
                    dangerousGoodsCodes, goodsDescriptionsCodes, specialHandlingCodes,
                    status, createdBy, createdById, userEmail, shipperId, shipperName,
                    shipperPhone, shipperEmail, shipperAddress, consigneeId, consigneeName,
                    consigneePhone, consigneeEmail, consigneeAddress, packageId,
                    packageBookingId, packageLength, packageWidth, packageHeight,
                    packageWeight, packageCount, flightName, flightDate, fromRegion, toRegion,
                    createdDate
                } = row;
    
                // Set flightName to "NONE" if status is "Unallocated"
                const finalFlightName = status === 'Unallocated' ? 'NONE' : flightName;
    
                if (!groupedBookings[awb]) {
                    groupedBookings[awb] = {
                        awb, rate, paymentTerms, cargoRate, totalInputWeight,
                        totalVolumetricWeight, finalWeight, shipperNotes, packagesCount,
                        dangerousGoodsCodes, goodsDescriptionsCodes, specialHandlingCodes,
                        status, createdBy, createdById, userEmail, shipperId, shipperName,
                        shipperPhone, shipperEmail, shipperAddress, consigneeId, consigneeName,
                        consigneePhone, consigneeEmail, consigneeAddress, flightName: finalFlightName,
                        flightDate,
                        fromRegion, toRegion, createdDate,
                        packages: []
                    };
                }
    
                groupedBookings[awb].packages.push({
                    packageId, packageBookingId, packageLength, packageWidth,
                    packageHeight, packageWeight, packageCount
                });
            });
    
            // Convert groupedBookings object to array
            const bookings = Object.values(groupedBookings);
    
            return bookings;
        } catch (err) {
            throw new Error('Error fetching all bookings: ' + err.message);
        }
    }
    


    async getAllFlightManifests(AircraftID = null, connectionID = null, Date = null, flightNO = null) {
        try {
            const pool = await this.db;
            const request = pool.request();
    
            // Input parameters with null defaults
            request.input('AircraftID', sql.Int, AircraftID || null);
            request.input('connectionID', sql.Int, connectionID || null);
            request.input('Date', sql.Date, Date || null);
            request.input('flightNO', sql.NVarChar, flightNO || null);
    
            // SQL query with conditional filtering
            const query = `
                SELECT 
                    b.awb AS awb, b.rate, b.paymentTerms, b.cargo_rate AS cargoRate, 
                    b.totalInputWeight, b.totalVolumetricWeight, b.finalWeight, 
                    b.shipper_notes AS shipperNotes, b.packages_count AS packagesCount, 
                    b.dangerous_goods_codes AS dangerousGoodsCodes, 
                    b.goods_descriptions_codes AS goodsDescriptionsCodes, 
                    b.special_handling_codes AS specialHandlingCodes, b.status, 
                    b.createdBy, b.createdById, b.userEmail, 
                    b.amountPaid AS amountPaid, b.balance AS balance, b.remarks as remarks, 
                    s.shipper_id AS shipperId, s.name AS shipperName, 
                    s.phone AS shipperPhone, s.email AS shipperEmail, 
                    s.address AS shipperAddress, 
                    c.consignee_id AS consigneeId, c.name AS consigneeName, 
                    c.phone AS consigneePhone, c.email AS consigneeEmail, 
                    c.address AS consigneeAddress, 
                    p.package_id AS packageId, p.booking_id AS packageBookingId, 
                    p.length AS packageLength, p.width AS packageWidth, 
                    p.height AS packageHeight, p.weight AS packageWeight, 
                    p.count AS packageCount, 
                    sch.flightName, b.masterAwb, 
                    COALESCE(CONVERT(VARCHAR, sch.Date, 103), '00-00-0000') AS flightDate, 
                    rf.RegionName AS fromRegion, rt.RegionName AS toRegion,
                    CONCAT(rf.RegionName, ' - ', rt.RegionName) AS route,
                    FORMAT(b.created_at, 'dd-MM-yyyy') AS createdDate
                FROM booking b
                INNER JOIN shipper s ON b.shipper_id = s.shipper_id
                INNER JOIN consignee c ON b.consignee_id = c.consignee_id
                INNER JOIN package p ON b.awb = p.booking_id
                INNER JOIN regionConnection rc ON b.routeID = rc.connectionID
                INNER JOIN region rf ON rc.fromRegionID = rf.RegionID
                INNER JOIN region rt ON rc.toRegionID = rt.RegionID
                INNER JOIN allotment a ON b.awb = a.booking_awb
                INNER JOIN schedule sch ON a.schedule_scheduleId = sch.ScheduleID
                WHERE (@AircraftID IS NULL OR sch.aircraftID = @AircraftID)
                AND (@connectionID IS NULL OR b.routeID = @connectionID)
                AND (@Date IS NULL OR sch.Date = @Date)
                AND (@flightNO IS NULL OR sch.flightName = @flightNO)
            `;
    
            const result = await request.query(query);
    
            // Process result to group packages by AWB
            const groupedBookings = {};
    
            result.recordset.forEach(row => {
                const {
                    awb, rate, paymentTerms, cargoRate, totalInputWeight,
                    totalVolumetricWeight, finalWeight, shipperNotes, packagesCount,
                    dangerousGoodsCodes, goodsDescriptionsCodes, specialHandlingCodes,
                    status, createdBy, createdById, userEmail, shipperId, shipperName,
                    shipperPhone,amountPaid,remarks,balance, shipperEmail, shipperAddress, consigneeId, consigneeName,
                    consigneePhone, consigneeEmail, consigneeAddress, packageId,
                    packageBookingId, packageLength, packageWidth, packageHeight,route,
                    packageWeight, packageCount, flightName, flightDate, masterAwb, 
                    fromRegion, toRegion, createdDate
                } = row;
    
                // Determine the master AWB
                let computedMasterAwb = masterAwb;
                if (flightName.startsWith('D3') || flightName.startsWith('D9') || !computedMasterAwb) {
                    computedMasterAwb = awb;
                }
    
                if (!groupedBookings[awb]) {
                    groupedBookings[awb] = {
                        awb, rate, paymentTerms, cargoRate, totalInputWeight,
                        totalVolumetricWeight, finalWeight, shipperNotes, packagesCount,
                        dangerousGoodsCodes,amountPaid,remarks,balance, goodsDescriptionsCodes, specialHandlingCodes,
                        status, createdBy, createdById, userEmail, shipperId, shipperName,
                        shipperPhone, shipperEmail, shipperAddress, consigneeId, consigneeName,
                        consigneePhone, consigneeEmail, consigneeAddress, flightName,route,
                        flightDate, masterAwb: computedMasterAwb, fromRegion, toRegion, createdDate,
                        packages: []
                    };
                }
    
                groupedBookings[awb].packages.push({
                    packageId, packageBookingId, packageLength, packageWidth,
                    packageHeight, packageWeight, packageCount
                });
            });
    
            // Convert groupedBookings object to array
            const bookings = Object.values(groupedBookings);
    
            // console.log(bookings);

            return bookings;
        } catch (err) {
            throw new Error('Error fetching all flight manifests: ' + err.message);
        }
    }
    

    async getRevenueReport(AircraftID = null, connectionID = null,  bookingDateFrom= null, bookingDateTo= null, flightNO = null) {
        try {
            const pool = await this.db;
            const request = pool.request();
    
            // Input parameters with null defaults
            request.input('AircraftID', sql.Int, AircraftID || null);
            request.input('connectionID', sql.Int, connectionID || null);
            request.input('fromDate', sql.Date, bookingDateFrom || null);
            request.input('toDate', sql.Date, bookingDateTo || null);
            request.input('flightNO', sql.NVarChar, flightNO || null);
    
            // SQL query with conditional filtering
            const query = `
                SELECT 
                    b.awb AS awb, b.rate, b.paymentTerms, b.cargo_rate AS cargoRate, 
                    b.totalInputWeight, b.totalVolumetricWeight, b.finalWeight, 
                    b.shipper_notes AS shipperNotes, b.packages_count AS packagesCount, 
                    b.dangerous_goods_codes AS dangerousGoodsCodes, 
                    b.goods_descriptions_codes AS goodsDescriptionsCodes, 
                    b.special_handling_codes AS specialHandlingCodes, b.status, 
                    b.createdBy, b.createdById, b.userEmail, 
                    b.amountPaid AS amountPaid, b.balance AS balance, b.remarks as remarks, 
                    s.shipper_id AS shipperId, s.name AS shipperName, 
                    s.phone AS shipperPhone, s.email AS shipperEmail, 
                    s.address AS shipperAddress, 
                    c.consignee_id AS consigneeId, c.name AS consigneeName, 
                    c.phone AS consigneePhone, c.email AS consigneeEmail, 
                    c.address AS consigneeAddress, 
                    p.package_id AS packageId, p.booking_id AS packageBookingId, 
                    p.length AS packageLength, p.width AS packageWidth, 
                    p.height AS packageHeight, p.weight AS packageWeight, 
                    p.count AS packageCount, 
                    sch.flightName, b.masterAwb, 
                    COALESCE(CONVERT(VARCHAR, sch.Date, 103), '00-00-0000') AS flightDate, 
                    rf.RegionName AS fromRegion, rt.RegionName AS toRegion,
                    CONCAT(rf.RegionName, ' - ', rt.RegionName) AS route,
                    FORMAT(b.created_at, 'dd-MM-yyyy') AS createdDate
                FROM booking b
                INNER JOIN shipper s ON b.shipper_id = s.shipper_id
                INNER JOIN consignee c ON b.consignee_id = c.consignee_id
                INNER JOIN package p ON b.awb = p.booking_id
                INNER JOIN regionConnection rc ON b.routeID = rc.connectionID
                INNER JOIN region rf ON rc.fromRegionID = rf.RegionID
                INNER JOIN region rt ON rc.toRegionID = rt.RegionID
                INNER JOIN allotment a ON b.awb = a.booking_awb
                INNER JOIN schedule sch ON a.schedule_scheduleId = sch.ScheduleID
                WHERE (@AircraftID IS NULL OR sch.aircraftID = @AircraftID)
                AND (@connectionID IS NULL OR b.routeID = @connectionID)
                AND (@fromDate IS NULL OR sch.Date >= @fromDate)
                AND (@toDate IS NULL OR sch.Date<= @toDate)
                AND (@flightNO IS NULL OR sch.flightName = @flightNO)
            `;
    
            const result = await request.query(query);
    
            // Process result to group packages by AWB
            const groupedBookings = {};
    
            result.recordset.forEach(row => {
                const {
                    awb, rate, paymentTerms, cargoRate, totalInputWeight,
                    totalVolumetricWeight, finalWeight, shipperNotes, packagesCount,
                    dangerousGoodsCodes, goodsDescriptionsCodes, specialHandlingCodes,
                    status, createdBy, createdById, userEmail, shipperId, shipperName,
                    shipperPhone,amountPaid,remarks,balance, shipperEmail, shipperAddress, consigneeId, consigneeName,
                    consigneePhone, consigneeEmail, consigneeAddress, packageId,
                    packageBookingId, packageLength, packageWidth, packageHeight,route,
                    packageWeight, packageCount, flightName, flightDate, masterAwb, 
                    fromRegion, toRegion, createdDate
                } = row;
    
                // Determine the master AWB
                let computedMasterAwb = masterAwb;
                if (flightName.startsWith('D3') || flightName.startsWith('D9') || !computedMasterAwb) {
                    computedMasterAwb = awb;
                }
    
                if (!groupedBookings[awb]) {
                    groupedBookings[awb] = {
                        awb, rate, paymentTerms, cargoRate, totalInputWeight,
                        totalVolumetricWeight, finalWeight, shipperNotes, packagesCount,
                        dangerousGoodsCodes,amountPaid,remarks,balance, goodsDescriptionsCodes, specialHandlingCodes,
                        status, createdBy, createdById, userEmail, shipperId, shipperName,
                        shipperPhone, shipperEmail, shipperAddress, consigneeId, consigneeName,
                        consigneePhone, consigneeEmail, consigneeAddress, flightName,route,
                        flightDate, masterAwb: computedMasterAwb, fromRegion, toRegion, createdDate,
                        packages: []
                    };
                }
    
                groupedBookings[awb].packages.push({
                    packageId, packageBookingId, packageLength, packageWidth,
                    packageHeight, packageWeight, packageCount
                });
            });
    
            // Convert groupedBookings object to array
            const bookings = Object.values(groupedBookings);
    
            // console.log(bookings);

            return bookings;
        } catch (err) {
            throw new Error('Error fetching all flight manifests: ' + err.message);
        }
    }
    
    

    async getAllFlightPerformances(flightNO = null, bookingDateFrom = null, bookingDateTo = null, connectionID = null, AircraftID = null) {
        try {
            const pool = await this.db;
            const request = pool.request();
    
            // Ensure default values are properly handled
            request.input('flightNO', sql.NVarChar, flightNO || null);
            request.input('fromDate', sql.Date, bookingDateFrom || null);
            request.input('toDate', sql.Date, bookingDateTo || null);
            request.input('connectionID', sql.Int, connectionID || null);
            request.input('AircraftID', sql.BigInt, AircraftID || null);
    
            // // Debug: log the parameters
            // console.log('Parameters:', {
            //     flightNO,
            //     bookingDateFrom,
            //     bookingDateTo,
            //     connectionID,
            //     AircraftID
            // });
    
            // SQL query with string manipulation to handle currency and numeric conversion
            const query = `
                SELECT 
                    sch.flightName AS flightNumber,
                    FORMAT(sch.Date, 'dd-MM-yyyy') AS date, -- Updated date format
                    rf.RegionName + ' - ' + rt.RegionName AS routing,
                    sch.AircraftID AS aircraft,
                    ac.registration AS aircraftRegistration,
                    SUM(b.packages_count) AS totalPcs,
                    SUM(b.totalInputWeight) AS totalWeightKg,
                    LEFT(b.rate, CHARINDEX(' ', b.rate) - 1) AS currency,
                    SUM(CAST(SUBSTRING(b.rate, CHARINDEX(' ', b.rate) + 1, LEN(b.rate)) AS decimal(10,2))) AS revenue
                FROM booking b
                INNER JOIN allotment al ON b.awb = al.booking_awb
                INNER JOIN schedule sch ON al.schedule_scheduleId = sch.ScheduleID
                INNER JOIN regionConnection rc ON b.routeID = rc.connectionID
                INNER JOIN region rf ON rc.fromRegionID = rf.RegionID
                INNER JOIN region rt ON rc.toRegionID = rt.RegionID
                INNER JOIN aircraft ac ON sch.AircraftID = ac.AircraftID
                WHERE 
                    (@flightNO IS NULL OR sch.flightName = @flightNO)
                    AND (@fromDate IS NULL OR sch.Date >= @fromDate)
                    AND (@toDate IS NULL OR sch.Date <= @toDate)
                    AND (@connectionID IS NULL OR b.routeID = @connectionID)
                    AND (@AircraftID IS NULL OR sch.AircraftID = @AircraftID)
                GROUP BY 
                    sch.flightName, 
                    FORMAT(sch.Date, 'dd-MM-yyyy'), 
                    rf.RegionName, 
                    rt.RegionName, 
                    sch.AircraftID, 
                    ac.registration, 
                    LEFT(b.rate, CHARINDEX(' ', b.rate) - 1)
            `;
    
    
            const result = await request.query(query);
    
    
            return result.recordset;
        } catch (err) {
            // Enhanced error logging
            console.error('Error fetching flight performances:', err.message, err);
            throw new Error('Error fetching flight performances: ' + err.message);
        }
    }

    async getAllFlights() {
        const pool = await this.db;
        const request = pool.request();

        const query = `
            SELECT DISTINCT flightName AS flightNumber
            FROM schedule
            ORDER BY flightName
        `;

        try {
            const result = await request.query(query);
            return result.recordset.map(row => row.flightNumber);
        } catch (error) {
            console.error('Error fetching flight names:', error);
            throw error;
        }
    }
    
    
}

module.exports = ReportModel;
