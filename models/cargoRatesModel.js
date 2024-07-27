const sql = require('mssql');

class CargoRatesModel {
    constructor(db) {
        this.db = db;
    }
    async getAllCargoRates() {
        try {
            // console.log("Fetching all cargo rates");
    
            const pool = await this.db;
            const request = pool.request();
    
            const query = `
                SELECT 
                    cr.CargoRateID,
                    cr.code, 
                    cr.currency, 
                    cr.rate,
                    cr.validfrom, 
                    cr.validtill, 
                    cr.applyto, 
                    cr.created_at, 
                    cr.updated_at,
                    CONCAT(r1.regionName, ' to ', r2.regionName) AS connection
                FROM 
                    cargorates cr
                INNER JOIN 
                    regionConnection rc ON cr.connectionID = rc.connectionID
                INNER JOIN 
                    region r1 ON rc.fromRegionID = r1.regionID
                INNER JOIN 
                    region r2 ON rc.toRegionID = r2.regionID;
            `;
    
            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            console.error('Error in getAllCargoRates:', err);
            throw new Error('Error fetching cargo rates: ' + err.message);
        }
    }
    
 

    async getCargoRatesForCompanyPerson(companyPersonID, connectionid) {
        try {
            const pool = await this.db; // Assuming this.db is your database connection pool
            const request = pool.request();
            // console.log("companyPersonID", companyPersonID);
    
            // Get CompanyID associated with companyPersonID
            const companyQuery = `
                SELECT companyID
                FROM companyPerson
                WHERE PersonID = @companyPersonID
            `;
    
            request.input('companyPersonID', sql.Int, companyPersonID);
            const companyResult = await request.query(companyQuery);
    
            if (!companyResult.recordset || companyResult.recordset.length === 0) {
                throw new Error(`No company found for companyPersonID ${companyPersonID}`);
            }
    
            const companyID = companyResult.recordset[0].companyID;
            // console.log("company ID", companyID);
    
            // Query to fetch cargo rates
            let query = `
                SELECT cr.CargoRateID, cr.code, cr.currency, cr.rate,
                       cr.validfrom, cr.validtill, cr.applyto, cr.created_at, cr.updated_at,
                       rc.fromRegionID AS FromID, rc.toRegionID AS ToID,
                       rFrom.RegionCode AS FromCode, rTo.RegionCode AS ToCode,
                       rFrom.tax AS FromTax, rFrom.taxCurrency AS FromTaxCurrency,
                       rTo.tax AS ToTax, rTo.taxCurrency AS ToTaxCurrency
                FROM cargorates cr
                INNER JOIN regionConnection rc ON cr.connectionid = rc.connectionid
                INNER JOIN region rFrom ON rc.fromRegionID = rFrom.RegionID
                INNER JOIN region rTo ON rc.toRegionID = rTo.RegionID
                LEFT JOIN cargorate_company cc ON cr.CargoRateID = cc.CargoRateID
                WHERE (cr.applyto = '*' OR cc.CompanyID = @CompanyID)
                    AND rc.connectionid = @connectionid
            `;
    
            request.input('CompanyID', sql.BigInt, companyID);
            request.input('connectionid', sql.Int, connectionid);
    
            const result = await request.query(query);
            const cargoRates = result.recordset.map(rate => ({
                cargoRateID: rate.CargoRateID,
                code: rate.code,
                currency: rate.currency,
                rate: rate.rate,
                validFrom: rate.validfrom,
                validTill: rate.validtill,
                applyTo: rate.applyto,
                createdAt: rate.created_at,
                updatedAt: rate.updated_at,
                route: `${rate.FromCode} to ${rate.ToCode}`,
                fromTax: rate.FromTax,
                fromTaxCurrency: rate.FromTaxCurrency,
                toTax: rate.ToTax,
                toTaxCurrency: rate.ToTaxCurrency
            }));
    
            // console.log("Cargo rates for company person and connection:", cargoRates);
    
            return cargoRates;
        } catch (err) {
            console.error('Error in getCargoRatesForCompanyPerson:', err);
            throw new Error('Error fetching cargo rates for company person: ' + err.message);
        }
    }
    
    
    
    
   async applyCargoRateToCompanies(cargoRateID, companyIDs) {
    try {
        const pool = await this.db;
        let query = '';

        if (!companyIDs.includes('*')) {
            for (const companyID of companyIDs) {
                query += sql`
                    INSERT INTO cargorate_company (CargoRateID, CompanyID)
                    VALUES (${cargoRateID}, ${companyID});
                `;
            }
        } else {
            query += sql`
                INSERT INTO cargorate_company (CargoRateID, CompanyID)
                SELECT ${cargoRateID}, CompanyID FROM companies;
            `;
        }

        const request = pool.request();
        const result = await request.query(query);
        return result.recordset;
    } catch (err) {
        console.error('Error in CargoRatesModel.applyCargoRateToCompanies:', err.message);
        throw new Error('Error applying cargo rate to companies: ' + err.message);
    }
}


    
    async getCargoRateById(rateId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('rateId', sql.BigInt, rateId);
            const query = `
                SELECT cr.*, cc.CompanyID
                FROM cargorates cr
                LEFT JOIN cargorate_company cc ON cr.CargoRateID = cc.CargoRateID
                WHERE cr.CargoRateID = @rateId
            `;
            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            console.error('Error in getCargoRateById:', err);
            throw new Error('Error fetching cargo rate by ID: ' + err.message);
        }
    }

    async getCargoCompanyById(rateId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('rateId', sql.BigInt, rateId);
            const query = `
                Select * FROM cargorate_company
                WHERE cargoRateID=@rateId;
            `;
            // console.log(rateId);
            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            console.error('Error in getCargoCompanyById:', err);
            throw new Error('Error fetching cargo rate by ID: ' + err.message);
        }
    }

    async createCargoRate(cargoRateData) {
        const { 
            code, 
            currency, 
            rate, 
            validFrom, 
            validTill, 
            connectionid,
            applyTo, 
            created_at, 
            updated_at 
        } = cargoRateData;
    
        try {
            const pool = await this.db;
            const request = pool.request();
            
            request.input('code', sql.NVarChar, code);
            request.input('connectionid', sql.Int, connectionid);
            request.input('currency', sql.NVarChar, currency);
            request.input('rate', sql.Decimal(10, 2), parseFloat(rate));
            request.input('validFrom', sql.Date, new Date(validFrom));
            request.input('validTill', sql.Date, new Date(validTill));
            request.input('applyTo', sql.NVarChar, applyTo.includes('*') ? '*' : applyTo.join(','));
            request.input('created_at', sql.DateTime, created_at ? new Date(created_at) : new Date());
            request.input('updated_at', sql.DateTime, updated_at ? new Date(updated_at) : new Date());
    
            const query = `
                INSERT INTO cargorates 
                (code, currency, rate, validfrom, validtill, connectionid, applyto, created_at, updated_at)
                OUTPUT INSERTED.CargoRateID
                VALUES (@code, @currency, @rate, @validFrom, @validTill, @connectionid, @applyTo, @created_at, @updated_at)
            `;
    
            const result = await request.query(query);
            const cargoRateID = result.recordset[0].CargoRateID;
    
            // Handle applyTo companies, excluding the '*' wildcard
            if (applyTo && !applyTo.includes('*')) {
                for (const companyID of applyTo) {
                    await pool.request()
                        .input('CargoRateID', sql.BigInt, cargoRateID)
                        .input('CompanyID', sql.BigInt, companyID)
                        .query('INSERT INTO cargorate_company (CargoRateID, CompanyID) VALUES (@CargoRateID, @CompanyID)');
                }
            }
    
            return { CargoRateID: cargoRateID };
        } catch (err) {
            console.error('Error creating cargo rate:', err.message);
            throw new Error('Error creating cargo rate: ' + err.message);
        }
    }
    async updateCargoRate(rateId, cargoRateData) {
        const { code, currency, rate, validFrom, connectionid, validTill, applyTo, updated_at } = cargoRateData;
    
        try {
            const convertDateToISO = (dateStr) => {
                const [day, month, year] = dateStr.split('-');
                return `${year}-${month}-${day}`;
            };
    
            const validFromDateStr = convertDateToISO(validFrom);
            const validTillDateStr = convertDateToISO(validTill);
    
            const pool = await this.db;
            const request = pool.request();
            request.input('rateId', sql.BigInt, rateId);
            request.input('code', sql.NVarChar, code);
            request.input('connectionid', sql.Int, connectionid);
            request.input('currency', sql.NVarChar, currency);
            request.input('rate', sql.Decimal(10, 2), rate);
            request.input('validfrom', sql.Date, validFromDateStr);
            request.input('validtill', sql.Date, validTillDateStr);
            request.input('applyTo', sql.NVarChar, applyTo.includes('*') ? '*' : applyTo.join(','));
            request.input('updated_at', sql.DateTime, updated_at);
    
            const query = `
                UPDATE cargorates
                SET code = @code, currency = @currency, connectionid = @connectionid, rate = @rate, 
                    validfrom = @validfrom, validtill = @validtill, applyto = @applyTo, updated_at = @updated_at
                WHERE CargoRateID = @rateId
            `;
    
            const result = await request.query(query);
    
            // Check if any rows were affected by the update
            if (result.rowsAffected[0] === 0) {
                throw new Error(`Cargo rate with ID ${rateId} not found or not updated.`);
            }
    
            // Delete existing applyTo associations and insert new ones
            await pool.request()
                .input('CargoRateID', sql.BigInt, rateId)
                .query('DELETE FROM cargorate_company WHERE CargoRateID = @CargoRateID');
    
            // Handle applyTo companies, excluding the '*' wildcard
            if (!applyTo.includes('*')) {
                for (const companyID of applyTo) {
                    await pool.request()
                        .input('CargoRateID', sql.BigInt, rateId)
                        .input('CompanyID', sql.BigInt, companyID)
                        .query('INSERT INTO cargorate_company (CargoRateID, CompanyID) VALUES (@CargoRateID, @CompanyID)');
                }
            }
    
            // Return the updated cargo rate
            return { CargoRateID: rateId, ...cargoRateData };
        } catch (err) {
            console.error('Error updating cargo rate:', err.message);
            throw new Error('Error updating cargo rate: ' + err.message);
        }
    }
    
    
    

    async deleteCargoRate(rateId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('rateId', sql.BigInt, rateId);

            const query = 'DELETE FROM cargorates WHERE CargoRateID = @rateId';
            const result = await request.query(query);
            if (result.rowsAffected[0] > 0) {
                await pool.request()
                    .input('CargoRateID', sql.BigInt, rateId)
                    .query('DELETE FROM cargorate_company WHERE CargoRateID = @CargoRateID');
                return true;
            } else {
                throw new Error('Error deleting cargo rate: No records deleted');
            }
        } catch (err) {
            console.error('Error deleting cargo rate:', err.message);
            throw new Error('Error deleting cargo rate: ' + err.message);
        }
    }

    async deleteCargoCompanyRate(rateId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('rateId', sql.BigInt, rateId);

            const query = 'DELETE FROM cargorate_company WHERE CargoRateID = @rateId';
            const result = await request.query(query);
            if (result.rowsAffected[0] > 0) {
                return true;
            } else {
                throw new Error('Error deleting cargocompany rate: No records deleted');
            }
        } catch (err) {
            console.error('Error deleting cargocompnay rate:', err.message);
            throw new Error('Error deleting cargocompany rate: ' + err.message);
        }
    }

    async activateCargoRate(rateId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('rateId', sql.BigInt, rateId);

            const query = `
                UPDATE cargorates
                SET activation_status = 1
                WHERE CargoRateID = @rateId
                OUTPUT INSERTED.*
            `;
            const result = await request.query(query);
            if (result.recordset.length > 0) {
                return result.recordset[0];
            } else {
                throw new Error('Error activating cargo rate: No records updated');
            }
        } catch (err) {
            console.error('Error activating cargo rate:', err.message);
            throw new Error('Error activating cargo rate: ' + err.message);
        }
    }

    async deactivateCargoRate(rateId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('rateId', sql.BigInt, rateId);

            const query = `
                UPDATE cargorates
                SET activation_status = 0
                WHERE CargoRateID = @rateId
                OUTPUT INSERTED.*
            `;
            const result = await request.query(query);
            if (result.recordset.length > 0) {
                return result.recordset[0];
            } else {
                throw new Error('Error deactivating cargo rate: No records updated');
            }
        } catch (err) {
            console.error('Error deactivating cargo rate:', err.message);
            throw new Error('Error deactivating cargo rate: ' + err.message);
        }
    }
}

module.exports = CargoRatesModel;
