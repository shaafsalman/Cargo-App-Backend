const sql = require('mssql');
const bcrypt = require('bcrypt');

const saltRounds = parseInt(process.env.SALT) || 10;



class CompanyPersonModel {
    constructor(db) {
        this.db = db;
    }

    async getAllCompanyPersons() {
        try {
            const pool = await this.db;
            const request = pool.request();
            const query = `
                SELECT personid, name, email, companyname, Deactive AS status
                FROM companyPerson
            `;
            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            console.error('Error in getAllCompanyPersons:', err);
            throw new Error('Error fetching company persons: ' + err.message);
        }
    }

    async getCompanyDetails(companyPersonId) {
        console.log('Getting company details:', companyPersonId);
        try {
            const pool = await this.db;
            const request = pool.request();
            
            // Declare input parameter
            request.input('companyPersonId', companyPersonId);
            
            const query = `
                SELECT c.name as companyName,c.Email AS companyEmail, c.Telephone AS phoneNumber, c.Address AS address
                FROM companyPerson cp
                INNER JOIN company c ON cp.CompanyID = c.CompanyID
                WHERE cp.PersonID = @companyPersonId
            `;
        
            const result = await request.query(query);
            if (result.recordset.length > 0) 
                {
                    console.log(result.recordset[0])
                const { companyName , companyEmail, phoneNumber, address } = result.recordset[0];
                return { companyName,companyEmail, phoneNumber, address };
            } else {
                return null;
            }
        } catch (err) {
            console.error('Error in getCompanyDetails function:', err);
            throw new Error('Error fetching company details: ' + err.message);
        }
    }
    
    
      
    async getCompanyPersonById(personId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('personId', sql.Int, personId);
            const query = 'SELECT * FROM companyPerson WHERE PersonID = @personId';
            const result = await request.query(query);
            return result.recordset[0];
        } catch (err) {
            throw new Error('Error fetching company person by ID: ' + err.message);
        }
    }
    async createCompanyPerson(companyPersonData) {
        const {
          name,
          email,
          password,
          created_at,
          updated_at,
          password_reset_token,
          remember_token,
          email_verified_at,
          companyname,
          companyid,
          Deactive 
        } = companyPersonData;
      
        console.log('Received daata:', companyPersonData);
      
        try {
          const pool = await this.db;
          const request = pool.request();
      
          // Input parameters for the SQL query
          request.input('name', sql.NVarChar, name);
          request.input('email', sql.NVarChar, email);
          request.input('password', sql.NVarChar, password);
          request.input('created_at', sql.DateTime, created_at || new Date());
          request.input('updated_at', sql.DateTime, updated_at || new Date());
          request.input('password_reset_token', sql.NVarChar, password_reset_token);
          request.input('remember_token', sql.NVarChar, remember_token);
          request.input('email_verified_at', sql.DateTime, email_verified_at || new Date());
          request.input('companyid', sql.BigInt, companyid);
          request.input('companyname', sql.NVarChar, companyname);
          request.input('Deactive', sql.Bit, Deactive);

      
          const query = `
            INSERT INTO companyPerson (name, email, password, created_at, updated_at, password_reset_token, remember_token, email_verified_at, companyid, companyname, Deactive)
            OUTPUT INSERTED.PersonID
            VALUES (@name, @email, @password, @created_at, @updated_at, @password_reset_token, @remember_token, @email_verified_at, @companyid, @companyname, @Deactive)
          `;
      
          const result = await request.query(query);
      
          if (result.recordset.length > 0) {
            return result.recordset[0];
          } else {
            throw new Error('Error creating company person: No records inserted');
          }
        } catch (err) {
          console.error('Error creating company person:', err.message);
          throw new Error('Error creating company person: ' + err.message);
        }
      }
      

    async updateCompanyPerson(personId, companyPersonData) {
        console.log("entered:");
        console.log(companyPersonData);
        const {name, email, password,status, companyid, companyname } = companyPersonData;
        try {
            let temp;
            if(status==='active'||temp==='Active'){
                temp=1;
            }
            else{
                temp=0;
            }
            console.log(password);
            const pool = await this.db;
            const request = pool.request();
            request.input('personId', sql.Int, personId);
            request.input('name', sql.NVarChar, name);
            request.input('email', sql.NVarChar, email);
            request.input('password', sql.NVarChar, password);
            request.input('updated_at', sql.DateTime, new Date());
            request.input('companyID', sql.BigInt, companyid);
            request.input('companyname', sql.NVarChar, companyname);
            request.input('Deactive', sql.Bit, temp);

            const query = `
                UPDATE companyPerson
                SET 
                    name = @name,
                    email = @email,
                    password = @password,
                    updated_at = @updated_at,
                    companyID = @companyID,
                    Deactive = @Deactive,
                    companyname=@companyname
                WHERE PersonID = @personId
            `;
            await request.query(query);
            return true;
        } catch (err) {
            throw new Error('Error updating company person: ' + err.message);
        }
    }

    async deleteCompanyPerson(personId) {
        console.log('Deleting company person from model ' + personId);
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('personId', sql.Int, personId);
            const query = 'DELETE FROM companyPerson WHERE PersonID = @personId';
            const result = await request.query(query);
            console.log(result);
            return result.rowsAffected > 0;
        } catch (err) {
            throw new Error('Error deleting company person: ' + err.message);
        }
    }

    async activateCompanyPerson(personId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('personId', sql.Int, personId);
            const query = 'UPDATE companyPerson SET Deactive = 1 WHERE PersonID = @personId';
            await request.query(query);
            return true;
        } catch (err) {
            throw new Error('Error activating company person: ' + err.message);
        }
    }

    async deactivateCompanyPerson(personId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('personId', sql.Int, personId);
            const query = 'UPDATE companyPerson SET Deactive = 0 WHERE PersonID = @personId';
            await request.query(query);
            return true;
        } catch (err) {
            throw new Error('Error deactivating company person: ' + err.message);
        }
    }

    async findByEmail(email) {
        console.log('inside findByEmail', email);
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('email', sql.NVarChar, email);
            const query = 'SELECT * FROM companyPerson WHERE email = @email';
            const result = await request.query(query);
            return result.recordset[0];
        } 
        catch (err) 
        {
            throw new Error('Error fetching company person by email: ' + err.message);
        }
    }
    async  updateCustomerDetails(id, name, email, companyName) {
        console.log('Updating customer details:', id);
        try {
            const pool = await this.db; 
            const request = pool.request();
            request.input('PersonID', sql.Int, id);
            request.input('Name', sql.NVarChar, name);
            request.input('Email', sql.NVarChar, email);
            request.input('CompanyName', sql.NVarChar, companyName);
    
            const query = `
                UPDATE companyPerson
                SET 
                    name = @Name
                FROM companyPerson cp
                JOIN company c ON cp.companyID = c.CompanyID
                WHERE cp.PersonID = @PersonID
                  AND c.Name = @CompanyName
            `;
    
            const result = await request.query(query);
            console.log(result);
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('Error updating customer details:', err.message);
            throw new Error('Error updating customer details: ' + err.message);
        }
    }
    
    async getDetails(id) {
        console.log('Getting details:', id);
        try {
            const pool = await this.db; 
            const request = pool.request();
            request.input('PersonID', sql.Int, id); 
    
            const query = `
                SELECT 
                    cp.PersonID,
                    cp.name AS name,
                    cp.email AS email,
                    cp.password AS password,
                    c.CompanyID,
                    c.Name AS companyName,
                    c.GroupID
                FROM 
                    companyPerson cp
                JOIN 
                    company c ON cp.companyID = c.CompanyID
                WHERE 
                    cp.PersonID = @PersonID
            `;
    
            const result = await request.query(query);
            console.log(result);
            if (result.recordset.length === 0) {
                throw new Error('CompanyPerson not found');
            }
    
            const companyPerson = result.recordset[0];
    
    
            return companyPerson;
        } catch (err) {
            console.error('Error fetching CompanyPerson details:', err.message);
            throw new Error('Error fetching CompanyPerson details: ' + err.message);
        }
    
    }
    async changePassword(id, oldPassword, newPassword) {
        console.log('Changing password for:', id);
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('PersonID', sql.Int, id);

            const getPasswordQuery = `
                SELECT password
                FROM companyPerson
                WHERE PersonID = @PersonID
            `;
            


            const result = await request.query(getPasswordQuery);
            if (result.recordset.length === 0) {
                return { success: false, message: 'User not found' };
            }



            const hashedPassword = result.recordset[0].password;


            // if(hashedPassword != oldPassword)
            //     {
            //         return { success: false, message: 'Old password is incorrect' };

            //     }
            // Compare old password with hashed password
            const passwordMatch = await bcrypt.compare(oldPassword, hashedPassword);
            if (!passwordMatch) {
                return { success: false, message: 'Old password is incorrect' };
            }

            // Hash the new password
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

            // Update the password in the database
            const updatePasswordQuery = `
                UPDATE companyPerson
                SET password = @NewPassword
                WHERE PersonID = @PersonID
            `;
            request.input('NewPassword', sql.NVarChar, hashedNewPassword);
            const updateResult = await request.query(updatePasswordQuery);

            console.log(updateResult);
            return { success: updateResult.rowsAffected[0] > 0, message: 'Password changed successfully' };
        } catch (err) {
            console.error('Error changing password:', err.message);
            throw new Error('Error changing password: ' + err.message);
        }
    }


}

module.exports = CompanyPersonModel;