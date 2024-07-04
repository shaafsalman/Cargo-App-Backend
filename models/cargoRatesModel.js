const sql = require('mssql');

class CargoRatesModel {
    constructor(db) {
        this.db = db;
    }
    async getAllCargoRates() {
        try {
            console.log("in cargo model");
            const pool = await this.db;
            const request = pool.request();
            
            const query = `
                SELECT cr.CargoRateID,cr.Category, cr.code, cr.ScheduleID, cr.currency, cr.rate, cr.otheramount, 
                       cr.validfrom, cr.validtill, cr.applyto, cr.created_at, cr.updated_at,
                       s.FromID, s.ToID, rFrom.RegionCode AS FromCode, rTo.RegionCode AS ToCode
                FROM cargorates cr
                INNER JOIN schedule s ON cr.ScheduleID = s.ScheduleID
                INNER JOIN region rFrom ON s.FromID = rFrom.RegionID
                INNER JOIN region rTo ON s.ToID = rTo.RegionID
            `;
            
            const result = await request.query(query);
            const cargoRates = result.recordset.map(rate => ({
                cargoRateID: rate.CargoRateID,
                code: rate.code,
                scheduleID: rate.ScheduleID,
                Category: rate.Category,
                currency: rate.currency,
                rate: rate.rate,
                otherAmount: rate.otheramount,
                validFrom: rate.validfrom,
                validTill: rate.validtill,
                applyTo: rate.applyto,
                createdAt: rate.created_at,
                updatedAt: rate.updated_at,
                route: `${rate.FromCode} to ${rate.ToCode}`
            }));
    
            console.log("Cargo rates with routes:", cargoRates);
    
            return cargoRates;
        } catch (err) {
            console.error('Error in getAllCargoRates:', err);
            throw new Error('Error fetching cargo rates: ' + err.message);
        }
    }

    async getCargoRatesForCompanyPerson(companyPersonID, fromID, toID) {
        try {
            const pool = await this.db; // Assuming this.db is your database connection pool
            const request = pool.request();

            let query = `
                SELECT cr.CargoRateID, cr.Category, cr.code, cr.ScheduleID, cr.currency, cr.rate, cr.otheramount,
                       cr.validfrom, cr.validtill, cr.applyto, cr.created_at, cr.updated_at,
                       s.FromID, s.ToID, rFrom.RegionCode AS FromCode, rTo.RegionCode AS ToCode
                FROM cargorates cr
                INNER JOIN schedule s ON cr.ScheduleID = s.ScheduleID
                INNER JOIN region rFrom ON s.FromID = rFrom.RegionID
                INNER JOIN region rTo ON s.ToID = rTo.RegionID
                LEFT JOIN cargorate_company cc ON cr.CargoRateID = cc.CargoRateID
                WHERE (cr.applyto = '*' OR cc.CompanyID = @companyPersonID)
                    AND s.FromID = @fromID
                    AND s.ToID = @toID
            `;

            request.input('companyPersonID', sql.BigInt, companyPersonID);
            request.input('fromID', sql.Int, fromID);
            request.input('toID', sql.Int, toID);

            const result = await request.query(query);
            const cargoRates = result.recordset.map(rate => ({
                cargoRateID: rate.CargoRateID,
                code: rate.code,
                scheduleID: rate.ScheduleID,
                Category: rate.Category,
                currency: rate.currency,
                rate: rate.rate,
                otherAmount: rate.otheramount,
                validFrom: rate.validfrom,
                validTill: rate.validtill,
                applyTo: rate.applyto,
                createdAt: rate.created_at,
                updatedAt: rate.updated_at,
                route: `${rate.FromCode} to ${rate.ToCode}`
            }));

            console.log("Cargo rates for company person and route:", cargoRates);

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

    async createCargoRate(cargoRateData) {
        const { 
            code, 
            scheduleID, 
            currency, 
            rate, 
            otherAmount, 
            validFrom, 
            validTill, 
            applyTo, 
            category, 
            created_at, 
            updated_at 
        } = cargoRateData;
    
        console.log('Model cargo rate data:', JSON.stringify(cargoRateData));
    
        try {
            const pool = await this.db;
            const request = pool.request();
            
            request.input('code', sql.NVarChar, code);
            request.input('ScheduleID', sql.BigInt, scheduleID);
            request.input('currency', sql.NVarChar, currency);
            request.input('rate', sql.Decimal(10, 2), parseFloat(rate));
            request.input('otherAmount', sql.Int, parseInt(otherAmount) || 0);
            request.input('validFrom', sql.Date, new Date(validFrom));
            request.input('validTill', sql.Date, new Date(validTill));
            request.input('applyTo', sql.NVarChar, applyTo.includes('*') ? '*' : applyTo.join(','));
            request.input('category', sql.NVarChar, category);
            request.input('created_at', sql.DateTime, created_at ? new Date(created_at) : new Date());
            request.input('updated_at', sql.DateTime, updated_at ? new Date(updated_at) : new Date());
    
            const query = `
                INSERT INTO cargorates 
                (code, ScheduleID, currency, rate, otheramount, validfrom, validtill, applyto, category, created_at, updated_at)
                OUTPUT INSERTED.CargoRateID
                VALUES (@code, @ScheduleID, @currency, @rate, @otherAmount, @validFrom, @validTill, @applyTo, @category, @created_at, @updated_at)
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
        const { code, ScheduleID, currency, rate, otheramount, validfrom, validtill, applyto, category, updated_at } = cargoRateData;
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('rateId', sql.BigInt, rateId);
            request.input('code', sql.NVarChar, code);
            request.input('ScheduleID', sql.BigInt, ScheduleID);
            request.input('currency', sql.NVarChar, currency);
            request.input('rate', sql.Decimal(10, 2), rate);
            request.input('otheramount', sql.Int, otheramount);
            request.input('validfrom', sql.Date, validfrom);
            request.input('validtill', sql.Date, validtill);
            request.input('applyto', sql.NVarChar, applyto.includes('*') ? '*' : null);
            request.input('category', sql.NVarChar, category);
            request.input('updated_at', sql.DateTime, updated_at);

            const query = `
                UPDATE cargorates
                SET code = @code, ScheduleID = @ScheduleID, currency = @currency, rate = @rate, otheramount = @otheramount, validfrom = @validfrom, validtill = @validtill,
                    applyto = @applyto, category = @category, updated_at = @updated_at
                WHERE CargoRateID = @rateId
                OUTPUT INSERTED.*
            `;
            const result = await request.query(query);
            const cargoRateID = result.recordset[0].CargoRateID;

            if (!applyto.includes('*')) {
                await pool.request()
                    .input('CargoRateID', sql.BigInt, cargoRateID)
                    .query('DELETE FROM cargorate_company WHERE CargoRateID = @CargoRateID');

                for (const companyID of applyto) {
                    await pool.request()
                        .input('CargoRateID', sql.BigInt, cargoRateID)
                        .input('CompanyID', sql.BigInt, companyID)
                        .query('INSERT INTO cargorate_company (CargoRateID, CompanyID) VALUES (@CargoRateID, @CompanyID)');
                }
            }

            return result.recordset[0];
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
