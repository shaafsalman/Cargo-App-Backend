const sql = require('mssql');

class FlightModel {
    constructor(db) {
        this.db = db;
    }

    async getAllFlights() {
        try {
            const pool = await this.db;
            const query = `
                SELECT flight.*, aircraft.Type AS AircraftType
                FROM flight
                INNER JOIN aircraft ON flight.AircraftID = aircraft.AircraftID
            `;
            const result = await pool.request().query(query);
            return result.recordset;
        } catch (err) {
            console.error('Error fetching all flights:', err);
            throw new Error('Database error: ' + err.message);
        }
    }

    async createFlight(flightData) {
        const { FlightNo, AircraftID } = flightData;
        try {
            const pool = await this.db;
            const query = `
                INSERT INTO flight (FlightNo, AircraftID)
                VALUES (@FlightNo, @AircraftID)
            `;
            await pool.request()
                .input('FlightNo', sql.NVarChar, FlightNo)
                .input('AircraftID', sql.BigInt, AircraftID)
                .query(query);
            return { message: 'Flight created successfully' };
        } catch (err) {
            console.error('Error creating flight:', err);
            throw new Error('Database error: ' + err.message);
        }
    }

    async getFlightById(id) {
        try {
            const pool = await this.db;
            const query = `
                SELECT flight.*, aircraft.Type AS AircraftType
                FROM flight
                INNER JOIN aircraft ON flight.AircraftID = aircraft.AircraftID
                WHERE flight.FlightID = @FlightID
            `;
            const result = await pool.request().input('FlightID', sql.BigInt, id).query(query);
            if (result.recordset.length > 0) {
                return result.recordset[0];
            } else {
                throw new Error('Flight not found');
            }
        } catch (err) {
            console.error('Error fetching flight by ID:', err);
            throw new Error('Database error: ' + err.message);
        }
    }

    async updateFlight(id, flightData) {
        const { FlightNo, AircraftID } = flightData;
        try {
            const pool = await this.db;
            const query = `
                UPDATE flight
                SET FlightNo = @FlightNo, AircraftID = @AircraftID
                WHERE FlightID = @FlightID
            `;
            await pool.request()
                .input('FlightID', sql.BigInt, id)
                .input('FlightNo', sql.NVarChar, FlightNo)
                .input('AircraftID', sql.BigInt, AircraftID)
                .query(query);
            return { message: 'Flight updated successfully' };
        } catch (err) {
            console.error('Error updating flight:', err);
            throw new Error('Database error: ' + err.message);
        }
    }

    async deleteFlight(id) {
        try {
            const pool = await this.db;
            const query = 'DELETE FROM flight WHERE FlightID = @FlightID';
            await pool.request().input('FlightID', sql.BigInt, id).query(query);
            return { message: 'Flight deleted successfully' };
        } catch (err) {
            console.error('Error deleting flight:', err);
            throw new Error('Database error: ' + err.message);
        }
    }
}

module.exports = FlightModel;
