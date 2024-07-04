const sql = require('mssql');
const moment = require('moment');


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
                    rFrom.RegionName AS fromname,
                    rTo.RegionName AS toname,
                    s.DistanceKM AS distanceKM,
                    s.flightName AS flightName,
                    s.activeDay AS activeDay,
                    s.AircraftID as aircraftid,
                    aircraft.Type AS aircraftType
                FROM 
                    schedule s
                INNER JOIN 
                    region AS rFrom ON s.FromID = rFrom.RegionID
                INNER JOIN 
                    region AS rTo ON s.ToID = rTo.RegionID
                INNER JOIN 
                    aircraft ON s.AircraftID = aircraft.AircraftID
            `;
            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            console.error('Error in getAllSchedules:', err);
            throw new Error('Error fetching schedules: ' + err.message);
        }
    }
    
    async getScheduleById(scheduleId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('scheduleId', sql.BigInt, scheduleId);
            const query = `
                SELECT 
                    s.ScheduleID AS scheduleid,
                    s.Date AS date,
                    rFrom.RegionName AS fromname,
                    rTo.RegionName AS toname,
                    s.DistanceKM AS distanceKM,
                    s.flightName AS flightName,
                    s.activeDay AS activeDay
                FROM 
                    schedule s
                INNER JOIN 
                    region AS rFrom ON s.FromID = rFrom.RegionID
                INNER JOIN 
                    region AS rTo ON s.ToID = rTo.RegionID
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
        console.log("Creating schedule in model:", scheduleData);
    
        try {
            const pool = await this.db;
            const request = pool.request();

            console.log("Creating schedule", scheduleData);
    
            // Format the date to 'YYYY-MM-DD'
            const formattedDate = moment(scheduleData.date, 'MM-DD-YYYY').format('YYYY-MM-DD');
    
            // Prepare input parameters for the query
            request.input('date', sql.Date, formattedDate);
            request.input('fromId', sql.Int, scheduleData.FromID);
            request.input('toId', sql.Int, scheduleData.ToID);
            request.input('distanceKM', sql.Float, scheduleData.DistanceKM);
            request.input('flightName', sql.NVarChar(255), scheduleData.flightName);
            request.input('activeDay', sql.NVarChar(50), scheduleData.activeDay);
            request.input('aircraftId', sql.Int, scheduleData.AircraftID);
    
            // SQL query to insert a new schedule
            const query = `
                INSERT INTO schedule (Date, FromID, ToID, DistanceKM, flightName, activeDay, AircraftID)
                VALUES (@date, @fromId, @toId, @distanceKM, @flightName, @activeDay, @aircraftId);
                SELECT SCOPE_IDENTITY() AS insertedId;
            `;
    
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
        const { date, from, to, flightName, activeDay, distanceKM } = scheduleData;
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('scheduleId', sql.BigInt, scheduleId);
            request.input('Date', sql.Date, date);
            request.input('from', sql.BigInt, from);
            request.input('to', sql.BigInt, to);
            request.input('flightName', sql.NVarChar, flightName);
            request.input('activeDay', sql.NVarChar, activeDay);
            request.input('DistanceKM', sql.Int, distanceKM);

            const query = `
                UPDATE schedule
                SET Date = @Date, FromID = @from, ToID = @to, flightName = @flightName, activeDay = @activeDay, DistanceKM = @DistanceKM
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
