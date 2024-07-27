const sql = require('mssql');

class CompanyModel {
    constructor(db) {
        this.db = db;
    }

    async getAllCompanies() {
        try {
            const pool = await this.db;
            const request = pool.request();
            const query = `
                SELECT companyid, name, address, telephone, email,city,country, whatsapp, postalcode, paymentterms, status
                FROM company
            `;
            const result = await request.query(query);
            // console.log("model data from DB",result);
            return result.recordset;
        } 
        catch (err) 
        {
            console.error('Error in getAllCompanies:', err);
            throw new Error('Error fetching companies: ' + err.message);
        }
    }
    async getPaymentTerms(companyPersonId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            
            // Constructing the SQL query to fetch payment terms based on company person's ID
            const query = `
                SELECT c.PaymentTerms
                FROM companyPerson cp
                INNER JOIN company c ON cp.companyID = c.CompanyID
                WHERE cp.PersonID = @companyPersonId
            `;
            
            request.input('companyPersonId', sql.Int, companyPersonId);
            const result = await request.query(query);
            // console.log(result);

            if (result.recordset.length === 0) {
                throw new Error('Payment terms not found for the provided company person ID');
            }

            const paymentTermsString = result.recordset[0].PaymentTerms;
            const paymentTermsArray = paymentTermsString.split(',').map(term => term.trim());
            //  console.log(paymentTermsArray);
            return paymentTermsArray;
                
        }
         catch (err) {
            console.error('Error fetching payment terms:', err.message);
            throw new Error('Error fetching payment terms: ' + err.message);
        }
    }

    async getSomeCompanies() {
        try {
          const pool = await this.db;
          const request = pool.request();
          const query = `
            SELECT companyid, name
            FROM company
          `;
          const result = await request.query(query);
          const companies = result.recordset;
      
          // Log received companies and their IDs
        //   console.log('Received Companies:');
          companies.forEach((company) => {
            // console.log(`Company Name: ${company.name}, ID: ${company.companyid}`);
          });
      
          return companies; // Return the fetched companies array
        } catch (err) {
          console.error('Error in getSomeCompanies:', err);
          throw new Error('Error fetching companies: ' + err.message);
        }
      }
      

    async getCompanyById(CompanyID) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('CompanyID', sql.BigInt, CompanyID);
            const query = 'SELECT * FROM company WHERE CompanyID = @CompanyID';
            const result = await request.query(query);
            return result.recordset[0];
        } catch (err) {
            throw new Error('Error fetching company by ID: ' + err.message);
        }
    }
    async createCompany(companyData) {
      const { name, address, postalcode, telephone, email,city,country, whatsapp, paymentterms, status } = companyData;
    
    //   console.log("Reached model");
    //   console.log(companyData);
    
      let tempStatus = status === 'Active' ? 1 : 0;
      let tempPostal = parseInt(postalcode, 10);
      let tempGroup = 1;
      const paymentTermsString = paymentterms.join(', ');
    
      try {
        const pool = await this.db;
        const request = pool.request();

        request.input('email', sql.NVarChar, email);
            const checkEmailQuery = 'SELECT COUNT(*) as count FROM company WHERE email = @email';
            const checkEmailResult = await request.query(checkEmailQuery);
    
            if (checkEmailResult.recordset[0].count > 0) {
                throw new Error('Error creating Company: Email already exists');
            }
    
        request.input('Name', sql.NVarChar, name);
        request.input('Address', sql.NVarChar, address);
        request.input('PostalCode', sql.Int, postalcode);
        request.input('Telephone', sql.NVarChar, telephone);
        // request.input('Email', sql.NVarChar, email);
        request.input('City', sql.NVarChar, city);
        request.input('Country', sql.NVarChar, country);
        request.input('WhatsApp', sql.NVarChar, whatsapp);
        request.input('PaymentTerms', sql.NVarChar, paymentTermsString);
        request.input('GroupID', sql.BigInt, tempGroup);
        request.input('Status', sql.Int, tempStatus);
    
        const query = `
          INSERT INTO company (Name, Address, PostalCode, Telephone, Email, WhatsApp, PaymentTerms,City,Country, GroupID, Status)
          VALUES (@Name, @Address, @PostalCode, @Telephone, @Email, @WhatsApp, @PaymentTerms,@City,@Country, @GroupID, @Status)
        `;
    
        const result = await request.query(query);
        // console.log(result);
    
        // sql.close();
    
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
          return true;
        } else {
          throw new Error('Error creating company: No records inserted');
        }
      } catch (err) {
        console.error('Error creating company:', err.message);
            throw new Error(err.message);
      }
    }

   
 
    


    async updateCompany(CompanyID, companyData) {
        const {
            name, address, city, postalcode, country, telephone, email, whatsapp,
            paymentterms,status, updated_at
        } = companyData;
        try {
          let temp;
            if(status==='Active'){
                temp=1;
            }
            else{
                temp=0;
            }
            const paymentTermsString = paymentterms.join(', ');
            const pool = await this.db;
            const request = pool.request();


            request.input('CompanyID', sql.Int, CompanyID);
            request.input('Email', sql.NVarChar, email);
            const checkEmailQuery = 'SELECT COUNT(*) as count FROM company WHERE email = @Email AND CompanyID != @CompanyID';
            const checkEmailResult = await request.query(checkEmailQuery);
    
            if (checkEmailResult.recordset[0].count > 0) {
                throw new Error('Error updating company: Email already exists');
            }

            // request.input('CompanyID', sql.BigInt, CompanyID);
            request.input('Name', sql.NVarChar, name);
            request.input('Address', sql.NVarChar, address);
            request.input('City', sql.NVarChar, city);
            request.input('PostalCode', sql.Int, postalcode);
            request.input('Country', sql.NVarChar, country);
            request.input('Telephone', sql.NVarChar, telephone);
            // request.input('Email', sql.NVarChar, email);
            request.input('WhatsApp', sql.NVarChar, whatsapp);
            request.input('PaymentTerms', sql.NVarChar, paymentTermsString);
            request.input('Status', sql.Int, temp);
            request.input('updated_at', sql.DateTime, updated_at);

            const query = `
                UPDATE company
                SET 
                    Name = @Name,
                    Address = @Address,
                    City = @City,
                    PostalCode = @PostalCode,
                    Country = @Country,
                    Telephone = @Telephone,
                    Email = @Email,
                    WhatsApp = @WhatsApp,
                    PaymentTerms = @PaymentTerms,
                    Status=@Status,
                    updated_at = @updated_at
                WHERE CompanyID = @CompanyID
            `;
            await request.query(query);
            return true;
        } catch (err) {
            console.error('Error updating company:', err.message);
            throw new Error(err.message);
        }
    }

    async deleteCompany(id) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('CompanyID', sql.BigInt, id);
            const query = 'DELETE FROM company WHERE CompanyID = @CompanyID';
            const result = await request.query(query);
            return result.rowsAffected > 0;
        } catch (err) {
            console.error('Error deleting company:', err.message);
            throw new Error(err.message);
        }
    }

    async activateCompany(companyId) {
      try {
          const pool = await this.db;
          const request = pool.request();
          request.input('companyId', sql.Int, companyId);
          const query = 'UPDATE company SET Status = 1 WHERE CompanyID = @companyId';
          const query2='UPDATE companyPerson SET Deactive = 1 WHERE companyID = @companyId';
          await request.query(query);
          await request.query(query2);
          return true;
      } catch (err) {
          throw new Error('Error activating admin: ' + err.message);
      }
  }

  async deactivateCompany(companyId) {
    try {
      const pool = await this.db;
      const request = pool.request();
      request.input('companyId', sql.Int, companyId);
  
      const query1 = 'UPDATE company SET Status = 0 WHERE CompanyID = @companyId';
      const query2 = 'UPDATE companyPerson SET Deactive = 0 WHERE companyID = @companyId';
  
      await request.query(query1);
      await request.query(query2);
  
      return true;
    } catch (err) {
      throw new Error('Error deactivating company: ' + err.message);
    }
  }
  

    async findByEmail(email) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('email', sql.NVarChar, email);
            const query = 'SELECT * FROM company WHERE Email = @email';
            const result = await request.query(query);
            return result.recordset[0];
        } catch (err) {
            console.error('Error fetching company by email:', err.message);
            throw new Error('Error fetching company by email: ' + err.message);
        }
    }
    
    

}

module.exports = CompanyModel;