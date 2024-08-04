const sql = require('mssql');
const bcrypt = require('bcrypt');

const saltRounds = parseInt(process.env.SALT) || 10;


class ConnectionModel {
    constructor(db) {
        this.db = db;
    }

    async getAllConnections() {
        try {
            const pool = await this.db;
            const request = pool.request();
            const query = `
                   
   SELECT 
   rc.connectionID,
   CONCAT(r1.regionName, ' to ', r2.regionName) AS connection
FROM 
   regionConnection rc
INNER JOIN 
   region r1 ON rc.fromRegionID = r1.regionID
INNER JOIN 
   region r2 ON rc.toRegionID = r2.regionID;
            `;
            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            console.error('Error in getAllConnections:', err);
            throw new Error('Error fetching connections: ' + err.message);
        }
    }
    async addConnection(connection) {
        const { fromRegionId, toRegionId, distance } = connection;
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('from', sql.NVarChar, fromRegionId);
            request.input('to', sql.NVarChar, toRegionId);
            request.input('distance', sql.Int, distance);
            const query = `
            INSERT INTO regionConnection (fromRegionID, toRegionID, distance)
            OUTPUT INSERTED.connectionID
            VALUES ((SELECT regionID FROM region WHERE regionName = @from), (SELECT regionID FROM region WHERE regionName = @to),
                @distance
            )
        `;
            await request.query(query);
            return true;
        } catch (err) {
            throw new Error('Error updating region: ' + err.message);
        }
    }
    async deleteConnection(connectionID) {
        try {
        console.log("in model");

            const pool = await this.db;
            const request = pool.request();
            request.input('connectionid', sql.Int, connectionID);
            const query = 'DELETE FROM regionConnection WHERE connectionID = @connectionID';
            const result = await request.query(query);
            return result.rowsAffected > 0;
        } catch (err) {
            throw new Error('Error deleting route: ' + err.message);
        }
    }
}

module.exports = ConnectionModel;
