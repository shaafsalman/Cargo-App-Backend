const sql = require('mssql');

class StatsModel {
    constructor(db) {
        this.db = db;
    }

    async getTotalFlights() {
        try {
            const pool = await this.db;
            const request = pool.request();
            const query = `
                SELECT COUNT(*) AS totalFlights
                FROM schedule
                WHERE status IN ('Departed', 'Arrived');
            `;
            const result = await request.query(query);
            return { success: true, data: result.recordset[0].totalFlights };
        } catch (err) {
            console.error('Error in getTotalFlights:', err);
            return { success: false, message: 'Database error: ' + err.message };
        }
    }


    async getUplift() {
        try {
            const pool = await this.db;
            const request = pool.request();
            const query = `
                SELECT 
                    ISNULL(SUM(totalInputWeight), 0) AS totalUplift
                FROM booking
                WHERE status IN ('Departed', 'Arrived');
            `;
            const result = await request.query(query);
            return { success: true, data: result.recordset[0].totalUplift };
        } catch (err) {
            console.error('Error in getUplift:', err);
            return { success: false, message: 'Database error: ' + err.message };
        }
    }

    async getAllocated() {
        try {
            const pool = await this.db;
            const request = pool.request();
            const query = `
                SELECT 
                    ISNULL(SUM(finalWeight), 0) AS totalAllocated
                FROM booking
                WHERE status = 'Allocated';
            `;
            const result = await request.query(query);
            return { success: true, data: result.recordset[0].totalAllocated };
        } catch (err) {
            console.error('Error in getAllocated:', err);
            return { success: false, message: 'Database error: ' + err.message };
        }
    }

    async getBooked() {
        try {
            const pool = await this.db;
            const request = pool.request();
            const query = `
                SELECT 
                    ISNULL(SUM(totalInputWeight), 0) AS totalBooked
                    FROM booking
                    WHERE status IN ('Unallocated', 'Allocated');
            `;
            const result = await request.query(query);
            return { success: true, data: result.recordset[0].totalBooked };
        } catch (err) {
            console.error('Error in getBooked:', err);
            return { success: false, message: 'Database error: ' + err.message };
        }
    }
    async getTopCompaniesByChargeableWeight() {
        try {
            const pool = await this.db;
            const request = pool.request();
    
            // Query to get the total chargeable weight for each company
            const topCompaniesQuery = `
                SELECT 
                    c.CompanyID, 
                    c.name, 
                    ISNULL(SUM(b.finalWeight), 0) AS totalChargeableWeight
                FROM softui.dbo.booking b
                JOIN softui.dbo.companyPerson cp ON b.createdById = cp.PersonID
                JOIN softui.dbo.company c ON cp.companyID = c.CompanyID
                WHERE b.status = 'Allocated'  
                GROUP BY c.CompanyID, c.name
                ORDER BY totalChargeableWeight DESC;
            `;
            const topCompaniesResult = await request.query(topCompaniesQuery);
    
            // Extract top companies and their chargeable weights
            const topCompanies = topCompaniesResult.recordset;
    
            // Query to get all companies
            const allCompaniesQuery = `
                SELECT CompanyID, name
                FROM softui.dbo.company;
            `;
            const allCompaniesResult = await request.query(allCompaniesQuery);
    
            // Create a map of all companies with default weight of 0
            const allCompanies = new Map();
            allCompaniesResult.recordset.forEach(company => {
                allCompanies.set(company.CompanyID, { name: company.name, totalChargeableWeight: 0 });
            });
    
            // Update the map with the top companies data
            topCompanies.forEach(company => {
                if (allCompanies.has(company.CompanyID)) {
                    allCompanies.set(company.CompanyID, { 
                        name: company.name, 
                        totalChargeableWeight: company.totalChargeableWeight 
                    });
                }
            });
    
            // Convert map to array
            const companyList = Array.from(allCompanies.values());
    
            // Sort by chargeable weight and slice to get top 10 or fewer
            const sortedCompanies = companyList
                .sort((a, b) => b.totalChargeableWeight - a.totalChargeableWeight)
                .slice(0, 10);
    
            // console.log(sortedCompanies);
            return { success: true, data: sortedCompanies };
        } catch (err) {
            console.error('Error in getTopCompaniesByChargeableWeight:', err);
            return { success: false, message: 'Database error: ' + err.message };
        }
    }
    async getBookingsByRegion() {
        try {
            const pool = await this.db;
            const request = pool.request();
            
            const query = `
                SELECT 
                    rFrom.RegionName AS regionFrom, 
                    COUNT(b.awb) AS totalBookings,
                    ISNULL(SUM(b.finalWeight), 0) AS totalFinalWeight
                FROM booking b
                JOIN regionConnection ro ON b.routeID = ro.connectionID
                JOIN region rFrom ON ro.fromRegionID = rFrom.RegionID
                GROUP BY rFrom.RegionName
                ORDER BY rFrom.RegionName;
            `;
            
            const result = await request.query(query);
            return { success: true, data: result.recordset };
        } catch (err) {
            console.error('Error in getBookingsByRegion:', err);
            return { success: false, message: 'Database error: ' + err.message };
        }
    }
    async getUpliftByMonth() {
        try {
            const pool = await this.db;
            const request = pool.request();
            
            const query = `
                SELECT 
                    rFrom.RegionName AS regionFrom, 
                    COUNT(b.awb) AS totalBookings,
                    ISNULL(SUM(b.finalWeight), 0) AS totalFinalWeight
                FROM booking b
                JOIN regionConnection ro ON b.routeID = ro.connectionID
                JOIN region rFrom ON ro.fromRegionID = rFrom.RegionID
                WHERE b.status IN ('Departed', 'Arrived')
                GROUP BY rFrom.RegionName
                ORDER BY rFrom.RegionName;
            `;
            
            const result = await request.query(query);
            // console.log(result);
            return { success: true, data: result.recordset };
        } catch (err) {
            console.error('Error in getBookingsByRegion:', err);
            return { success: false, message: 'Database error: ' + err.message };
        }
    }
    
    
    
    
    
}    

module.exports = StatsModel;
