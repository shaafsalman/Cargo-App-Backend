const sql = require('mssql');

class RegionModel {
    constructor(db) {
        this.db = db;
    }

    async getAllRegions() {
        try {
            const pool = await this.db;
            const request = pool.request();
            const query = `
                SELECT regionid, regionname, regioncode, tax, charges, taxCurrency
                FROM region
            `;
            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            console.error('Error in getAllRegions:', err);
            throw new Error('Error fetching regions: ' + err.message);
        }
    }

    async getRegionById(regionId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('regionId', sql.Int, regionId);
            const query = 'SELECT * FROM region WHERE RegionID = @regionId';
            const result = await request.query(query);
            return result.recordset[0];
        } catch (err) {
            throw new Error('Error fetching region by ID: ' + err.message);
        }
    }

    async createRegion(regionData) {
        const { name, code } = regionData;
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('name', sql.NVarChar, name);
            request.input('code', sql.NVarChar, code);

            const query = `
                INSERT INTO region (name, code)
                OUTPUT INSERTED.RegionID
                VALUES (@name, @code)
            `;
            const result = await request.query(query);

            if (result.recordset.length > 0) {
                return result.recordset[0];
            } else {
                throw new Error('Error creating region: No records inserted');
            }
        } catch (err) {
            console.error('Error creating region:', err.message);
            throw new Error('Error creating region: ' + err.message);
        }
    }

    async updateRegion(regionId, regionData) {
        const { name, code } = regionData;
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('regionId', sql.Int, regionId);
            request.input('name', sql.NVarChar, name);
            request.input('code', sql.NVarChar, code);

            const query = `
                UPDATE region
                SET name = @name, code = @code
                WHERE RegionID = @regionId
            `;
            await request.query(query);
            return true;
        } catch (err) {
            throw new Error('Error updating region: ' + err.message);
        }
    }

    async deleteRegion(regionId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('regionId', sql.Int, regionId);
            const query = 'DELETE FROM region WHERE RegionID = @regionId';
            const result = await request.query(query);
            return result.rowsAffected > 0;
        } catch (err) {
            throw new Error('Error deleting region: ' + err.message);
        }
    }
}

module.exports = RegionModel;