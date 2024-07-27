const sql = require('mssql');
const moment = require('moment');
const { formatTime } = require('../Utility/dateUtils');

class ScheduleModel {
    constructor(db) {
        this.db = db;
    }

    async getAllSchedules() {
        try {
            const pool = await this.db;
            const request = pool.request();
            const query = `
            SELECT 
            s.ScheduleID AS scheduleid,
            s.Date AS date,
            s.flightName AS flightName,
            s.activeDay AS activeDay,
            s.AircraftID AS aircraftid,
            aircraft.Type AS aircraftType,
            s.arrTime AS arrTime,
            s.status AS state,
            s.depTime AS depTime,
            CONCAT(r1.regionName, ' to ', r2.regionName) AS connection
        FROM 
            schedule s
        INNER JOIN 
            regionConnection rc ON s.connectionID = rc.connectionID
        INNER JOIN 
            region r1 ON rc.fromRegionID = r1.regionID
        INNER JOIN 
            region r2 ON rc.toRegionID = r2.regionID
        INNER JOIN 
            aircraft ON s.AircraftID = aircraft.AircraftID;     
`;

            const result = await request.query(query);
            console.log("model", result);
            return result.recordset;
        } catch (err) {
            console.error('Error in getAllSchedules:', err);
            throw new Error('Error fetching schedules: ' + err.message);
        }
    }

    
    async getSchedulesByFromTo(routeID) {
        try {
            const pool = await this.db;
            const request = pool.request();
            const query = `
                SELECT 
                    s.ScheduleID AS scheduleid,
                    s.Date AS date,
                    rFrom.RegionName AS fromname,
                    rTo.RegionName AS toname,
                    s.flightName AS flightName,
                    s.activeDay AS activeDay,
                    s.AircraftID AS aircraftid,
                    aircraft.Type AS aircraftType,
                    aircraft.Capacity AS capacity,
                    s.usedCapacity AS usedCapacity, 
                    s.arrTime AS arrTime,
                    s.depTime AS depTime,
                    s.status AS status
                FROM 
                    schedule s
                INNER JOIN 
                    regionConnection AS rc ON s.connectionID = rc.connectionID
                INNER JOIN 
                    region AS rFrom ON rc.fromRegionID = rFrom.RegionID
                INNER JOIN 
                    region AS rTo ON rc.toRegionID = rTo.RegionID
                INNER JOIN 
                    aircraft ON s.AircraftID = aircraft.AircraftID
                WHERE 
                    s.connectionID = @connectionID
                    AND
                    s.status = 'Processing'
            `;
            
            console.log('Query:', query); // Log the constructed SQL query
            console.log('Parameters:', { routeID }); // Log input parameters
        
            request.input('connectionID', routeID);
        
            const result = await request.query(query);
            console.log('Result:', result); // Log the result from the database query
    
            return result.recordset;
        } catch (err) {
            console.error('Error in getSchedulesByFromTo:', err);
            throw new Error('Error fetching schedules by connectionID: ' + err.message);
        }
    }
    

    async getSchedulesByTo(toId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            const query = `
                SELECT 
                    s.ScheduleID AS scheduleid,
                    s.Date AS date,
                    rc.connectionID,
                    rc.fromRegionID,
                    rc.toRegionID,
                    rc.distance,
                    rFrom.RegionName AS fromname,
                    rTo.RegionName AS toname,
                    s.flightName AS flightName,
                    s.activeDay AS activeDay,
                    s.status AS status,
                    s.AircraftID AS aircraftid,
                    aircraft.Type AS aircraftType,
                    aircraft.Capacity AS capacity,
                    s.usedCapacity AS usedCapacity,
                    s.arrTime AS arrTime,
                    s.depTime AS depTime
                FROM 
                    schedule s
                INNER JOIN 
                    regionConnection rc ON s.connectionID = rc.connectionID
                INNER JOIN 
                    region rFrom ON rc.fromRegionID = rFrom.RegionID
                INNER JOIN 
                    region rTo ON rc.toRegionID = rTo.RegionID
                INNER JOIN 
                    aircraft ON s.AircraftID = aircraft.AircraftID
                WHERE 
                    rc.toRegionID = @toId
            `;
            
            console.log('Query:', query); // Log the constructed SQL query
            console.log('Parameters:', { toId }); // Log input parameters
        
            request.input('toId', toId);
        
            const result = await request.query(query);
            
            // If status is null or not found, set it to 'Processing'
            result.recordset.forEach(schedule => {
                if (!schedule.status) {
                    schedule.status = 'Processing';
                }
            });
    
            return result.recordset;
        } catch (err) {
            console.error('Error in getSchedulesByTo:', err);
            throw new Error('Error fetching schedules by ToID: ' + err.message);
        }
    }
    

    async getSchedulesByFrom(fromId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            const query = `
                SELECT 
                    s.ScheduleID AS scheduleid,
                    s.Date AS date,
                    rc.connectionID,
                    rc.fromRegionID,
                    rc.toRegionID,
                    rc.distance,
                    rFrom.RegionName AS fromname,
                    rTo.RegionName AS toname,
                    s.flightName AS flightName,
                    s.activeDay AS activeDay,
                    s.status AS status,
                    s.AircraftID AS aircraftid,
                    aircraft.Type AS aircraftType,
                    aircraft.Capacity AS capacity,
                    s.usedCapacity AS usedCapacity,
                    s.arrTime AS arrTime,
                    s.depTime AS depTime
                FROM 
                    schedule s
                INNER JOIN 
                    regionConnection rc ON s.connectionID = rc.connectionID
                INNER JOIN 
                    region rFrom ON rc.fromRegionID = rFrom.RegionID
                INNER JOIN 
                    region rTo ON rc.toRegionID = rTo.RegionID
                INNER JOIN 
                    aircraft ON s.AircraftID = aircraft.AircraftID
                WHERE 
                    rc.fromRegionID = @fromId
            `;
            
            console.log('Query:', query); // Log the constructed SQL query
            console.log('Parameters:', { fromId }); // Log input parameters
        
            request.input('fromId', fromId);
        
            const result = await request.query(query);
            
            // If status is null or not found, set it to 'Processing'
            result.recordset.forEach(schedule => {
                if (!schedule.status) {
                    schedule.status = 'Processing';
                }
            });
    
            return result.recordset;
        } catch (err) {
            console.error('Error in getSchedulesByFrom:', err);
            throw new Error('Error fetching schedules by FromID: ' + err.message);
        }
    }
    
    
    
    
    
    
    
    
    async getScheduleById(scheduleId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('scheduleId', sql.BigInt, scheduleId);
            const query = `
                SELECT 
                    *
                FROM 
                    schedule s
                WHERE 
                    s.ScheduleID = @scheduleId
            `;
            const result = await request.query(query);
            return result.recordset[0];
        } catch (err) {
            throw new Error('Error fetching schedule by ID: ' + err.message);
        }
    }

    async createSchedule(scheduleData) {
        // console.log("Creating schedule in model:", scheduleData);
    
        try {
            const pool = await this.db;
            const request = pool.request();
    
            // console.log("Creating schedule", scheduleData);
    
            // Format the date to 'YYYY-MM-DD'
            const formattedDate = moment(scheduleData.date, 'YYYY-MM-DD').format('YYYY-MM-DD');
            // console.log('Arrival Time:', scheduleData.formattedArrTime.toString());
            // console.log('Departure Time:', scheduleData.formattedDepTime);
            // Prepare input parameters for the query
            request.input('date', sql.Date, formattedDate);
            request.input('connectionid', sql.Int, scheduleData.connectionid);
            request.input('flightName', sql.NVarChar(255), scheduleData.flightName);
            request.input('activeDay', sql.NVarChar(50), scheduleData.activeDay);
            request.input('aircraftId', sql.Int, scheduleData.AircraftID);
            request.input('arrTime', sql.NVarChar(255) , scheduleData.formattedArrTime);
            request.input('depTime', sql.NVarChar(255), scheduleData.formattedDepTime);
            // SQL query to insert a new schedule
            const query = `
    INSERT INTO schedule (Date, flightName, activeDay, AircraftID, arrTime, depTime,connectionid )
    VALUES (@date, @flightName, @activeDay, @aircraftId, @arrTime, @depTime, @connectionid);
    SELECT SCOPE_IDENTITY() AS insertedId;
`;

     // console.log('Executing SQL query:', query);

            // Execute the query
            const result = await request.query(query);
    
            // Return the inserted schedule ID
            return result.recordset[0].insertedId;
        } catch (err) {
            console.error('Error creating schedule:', err);
            throw new Error('Error creating schedule: ' + err.message);
        }
    }
    
    async updateSchedule(scheduleId, scheduleData) {
        // console.log("successfully in schedule model");
        const { connectionid ,formattedArrTime,formattedDepTime,AircraftID,flightName,date } = scheduleData;
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('scheduleId', sql.BigInt, scheduleId);
            // request.input('Date', sql.Date, date);
            request.input('connectionid', sql.Int, connectionid);
            // request.input('fromname', sql.NVarChar, fromname);
            // request.input('toname', sql.NVarChar, toname);
            request.input('flightName', sql.NVarChar, flightName);
            // request.input('activeDay', sql.NVarChar, activeDay);
            request.input('date', sql.NVarChar, date);
            request.input('arrTime', sql.NVarChar, formattedArrTime);
            request.input('depTime', sql.NVarChar, formattedDepTime);
            request.input('aircraftId', sql.Int, AircraftID);

            const query = `
                UPDATE schedule
                SET connectionid=@connectionid, date=@date, flightName = @flightName,arrTime=@arrTime, depTime=@depTime, AircraftID=@AircraftID
                WHERE ScheduleID = @scheduleId
            `;
            await request.query(query);
            return true;
        } catch (err) {
            throw new Error('Error updating schedule: ' + err.message);
        }
    }

    async deleteSchedule(scheduleId) {
        try {
            console.log("in model");
            const pool = await this.db;
            const request = pool.request();
            request.input('scheduleId', sql.BigInt, scheduleId);
            const query = 'DELETE FROM schedule WHERE ScheduleID = @scheduleId';
            const result = await request.query(query);
            return result.rowsAffected > 0;
        } catch (err) {
            throw new Error('Error deleting schedule: ' + err.message);
        }
    }
}

module.exports = ScheduleModel;
