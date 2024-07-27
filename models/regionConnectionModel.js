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
}

module.exports = ConnectionModel;
