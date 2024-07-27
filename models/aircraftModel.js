
const sql = require('mssql');

class AircraftModel {
    constructor(db) {
        this.db = db;
    }

    async getAllAircrafts() {
        try {
            const pool = await this.db;
            const query = 'SELECT aircraftid,type,registration,capacity,operator,marketingby FROM aircraft';
            const result = await pool.request().query(query);
            return result.recordset;
        } catch (err) {
            console.error('Error fetching all aircrafts:', err);
            throw new Error('Database error: ' + err.message);
        }
    }

    async createAircraft(aircraftData) {
        // console.log("received:");
        // console.log(aircraftData);
        const { type, registration, capacity, operator,marketingby } = aircraftData;
        try {
            const pool = await this.db;
            const query = `
                INSERT INTO aircraft (Type, Registration, Capacity, Operator, MarketingBy)
                VALUES (@Type, @Registration, @Capacity, @Operator, @MarketingBy)
            `;
            await pool.request()
                .input('Type', sql.NVarChar, type)
                .input('Registration', sql.NVarChar, registration)
                .input('Capacity', sql.Int, capacity)
                .input('Operator', sql.NVarChar, operator)
                .input('MarketingBy', sql.NVarChar, marketingby)
                .query(query);
            return { message: 'Aircraft created successfully' };
        } catch (err) {
            console.error('Error creating aircraft:', err);
            throw new Error('Database error: ' + err.message);
        }
    }

    async getAircraftById(id) {
        try {
            const pool = await this.db;
            const query = 'SELECT * FROM aircraft WHERE AircraftID = @AircraftID';
            const result = await pool.request().input('AircraftID', sql.BigInt, id).query(query);
            if (result.recordset.length > 0) {
                return result.recordset[0];
            } else {
                throw new Error('Aircraft not found');
            }
        } catch (err) {
            console.error('Error fetching aircraft by ID:', err);
            throw new Error('Database error: ' + err.message);
        }
    }

    async updateAircraft(id, aircraftData) {
        const { type, registration, capacity, operator,marketingby } = aircraftData;
        try {
            const pool = await this.db;
            const query = `
                UPDATE aircraft
                SET Type = @Type, Registration = @Registration, Capacity = @Capacity, Operator = @Operator, MarketingBy = @MarketingBy,updated_at=@updated_at
                WHERE AircraftID = @AircraftID
            `;
            await pool.request()
                .input('AircraftID', sql.BigInt, id)
                .input('Type', sql.NVarChar, type)
                .input('Registration', sql.NVarChar, registration)
                .input('Capacity', sql.Int, capacity)
                .input('Operator', sql.NVarChar, operator)
                .input('MarketingBy', sql.NVarChar, marketingby)
                .input('updated_at', sql.DateTime, new Date())
                .query(query);
            return { message: 'Aircraft updated successfully' };
        } catch (err) {
            console.error('Error updating aircraft:', err);
            throw new Error('Database error: ' + err.message);
        }
    }

    async deleteAircraft(id) {
        try {
            const pool = await this.db;
            const query = 'DELETE FROM aircraft WHERE AircraftID = @AircraftID';
            await pool.request().input('AircraftID', sql.BigInt, id).query(query);
            return { message: 'Aircraft deleted successfully' };
        } catch (err) {
            console.error('Error deleting aircraft:', err);
            throw new Error('Database error: ' + err.message);
        }
    }
}

module.exports = AircraftModel;
