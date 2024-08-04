const sql = require('mssql');
const bcrypt = require('bcrypt');
const saltRounds = parseInt(process.env.SALT) || 10;
const AccountEmailSender = require('../Utility/AccountEmailSender'); 

class AdminModel {
    constructor(db) {
        this.db = db;
    }

    async getAllAdmins() {
        try {
            const pool = await this.db;
            const request = pool.request();
            const query = `
                SELECT adminid, name, email, activation_status AS status
                FROM admin
            `;
            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            console.error('Error in getAllAdmins:', err);
            throw new Error('Error fetching admins: ' + err.message);
        }
    }

    async getAdminById(adminId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('adminId', sql.Int, adminId);
            const query = 'SELECT * FROM admin WHERE AdminID = @adminId';
            const result = await request.query(query);
            return result.recordset[0];
        } catch (err) {
            throw new Error('Error fetching admin by ID: ' + err.message);
        }
    }

    async createAdmin(adminData) {
        const { name, email, password,RealPassword, created_at, updated_at, password_reset_token, GroupID, CustomerID, remember_token, email_verified_at, activation_status } = adminData;
        try {
            const pool = await this.db;
            const request = pool.request();
    
            // Check if email already exists
            request.input('email', sql.NVarChar, email);
            const checkEmailQuery = 'SELECT COUNT(*) as count FROM admin WHERE email = @email';
            const checkEmailResult = await request.query(checkEmailQuery);
            const checkEmployee = 'SELECT COUNT(*) as count FROM employee WHERE email = @email';
            const checkEmployeeResult = await request.query(checkEmployee);
            const checkCompanyPerson = 'SELECT COUNT(*) as count FROM companyPerson WHERE email = @email';
            const checkCompanyPersonResult = await request.query(checkCompanyPerson);
            const checkCompany = 'SELECT COUNT(*) as count FROM company WHERE email = @email';
            const checkCompanyResult = await request.query(checkCompany);
    
            if (checkEmailResult.recordset[0].count > 0 || checkEmployeeResult.recordset[0].count > 0 || checkCompanyPersonResult.recordset[0].count > 0 || checkCompanyResult.recordset[0].count > 0) {
                throw new Error('Error creating admin: Email already exists');
            }
    
            // Proceed with creating admin
            request.input('name', sql.NVarChar, name);
            request.input('password', sql.NVarChar, password);
            request.input('created_at', sql.DateTime, created_at);
            request.input('updated_at', sql.DateTime, updated_at);
            request.input('password_reset_token', sql.NVarChar, password_reset_token);
            request.input('GroupID', sql.Int, GroupID);
            request.input('CustomerID', sql.Int, CustomerID);
            request.input('remember_token', sql.NVarChar, remember_token);
            request.input('email_verified_at', sql.DateTime, email_verified_at);
            request.input('activation_status', sql.Int, activation_status);
    
            const query = `
                INSERT INTO admin (name, email, password, created_at, updated_at, password_reset_token, GroupID, CustomerID, remember_token, email_verified_at, activation_status)
                OUTPUT INSERTED.AdminID
                VALUES (@name, @email, @password, @created_at, @updated_at, @password_reset_token, @GroupID, @CustomerID, @remember_token, @email_verified_at, @activation_status)
            `;
            const result = await request.query(query);
    
            if (result.recordset.length > 0) {
                 AccountEmailSender(email, name, RealPassword, "Admin");
                return result.recordset[0];
            } else {
                throw new Error('Error creating admin: No records inserted');
            }
        } catch (err) {
            console.error('Error creating admin:', err.message);
            throw new Error(err.message);
        }
    }
    async updateAdmin(adminId, updatedAdminData) {
        const { name, email, status } = updatedAdminData;
        try {
            const pool = await this.db; // Assuming this.db is your database connection pool
            const request = pool.request();
            let temp;
            if(status==='Active'){
                temp=1;
            }
            else{
                temp=0;
            }

            // Check if email already exists
            request.input('adminId', sql.Int, adminId);
            request.input('email', sql.NVarChar, email);
            const checkEmailQuery = 'SELECT COUNT(*) as count FROM admin WHERE email = @email AND AdminID != @adminId';
            const checkEmailResult = await request.query(checkEmailQuery);
            const checkEmployee = 'SELECT COUNT(*) as count FROM employee WHERE email = @email';
            const checkEmployeeResult = await request.query(checkEmployee);
            const checkCompanyPerson = 'SELECT COUNT(*) as count FROM companyPerson WHERE email = @email';
            const checkCompanyPersonResult = await request.query(checkCompanyPerson);
            const checkCompany = 'SELECT COUNT(*) as count FROM company WHERE email = @email';
            const checkCompanyResult = await request.query(checkCompany);
    
            if (checkEmailResult.recordset[0].count > 0 || checkEmployeeResult.recordset[0].count > 0 || checkCompanyPersonResult.recordset[0].count > 0 || checkCompanyResult.recordset[0].count > 0) {
                throw new Error('Error creating admin: Email already exists');
            }
            
            // Add input parameters for the query
            // request.input('adminId', sql.Int, adminId);
            request.input('name', sql.NVarChar, name);
            // request.input('email', sql.NVarChar, email);
            request.input('activation_status', sql.Int, temp);
            request.input('updated_at', sql.DateTime, new Date());
    
            // Construct the SQL query
            const query = `
                UPDATE admin
                SET name = @name,
                    email = @email,
                    activation_status = @activation_status,
                    updated_at = @updated_at
                WHERE AdminID = @adminId;
            `;
    
            // Execute the query
            const result = await request.query(query);
    
            // Check if any rows were affected
            if (result.rowsAffected[0] > 0) {
                return true; // Return true if the update was successful
            } else {
                throw new Error(`Admin with ID ${adminId} not found or no changes made.`);
            }
        } catch (err) {
            console.error('Error updating admin:', err.message);
            throw new Error(err.message);
        }
    }
    

    async deleteAdmin(adminId) {
        console.log('Deleting admin form model ' + adminId);
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('adminId', sql.Int, adminId);
            const query = 'DELETE FROM admin WHERE AdminID = @adminId';
            const result = await request.query(query);
            // console.log(result);
            return result.rowsAffected > 0;
        } catch (err) {
            throw new Error('Error deleting admin: ' + err.message);
        }
    }

    async activateAdmin(adminId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('adminId', sql.Int, adminId);
            const query = 'UPDATE admin SET activation_status = 1 WHERE AdminID = @adminId';
            await request.query(query);
            return true;
        } catch (err) {
            throw new Error('Error activating admin: ' + err.message);
        }
    }

    async deactivateAdmin(adminId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('adminId', sql.Int, adminId);
            const query = 'UPDATE admin SET activation_status = 0 WHERE AdminID = @adminId';
            await request.query(query);
            return true;
        } catch (err) {
            throw new Error('Error deactivating admin: ' + err.message);
        }
    }

    async findByEmail(email) {
        // console.log('inside findByEmail', email);
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('email', sql.NVarChar, email);
            const query = 'SELECT * FROM admin WHERE email = @email';
            const result = await request.query(query);
            return result.recordset[0];
        } catch (err) {
            throw new Error('Error fetching admin by email: ' + err.message);
        }
    }
    
    async updateAdminDetails(id, name, email) {
        // console.log('Updating admin details:', id);
        try {
            const pool = await this.db; 
            const request = pool.request();
            request.input('AdminID', sql.Int, id);
            request.input('Name', sql.NVarChar, name);
            request.input('Email', sql.NVarChar, email);
    
            const query = `
                UPDATE admin
                SET 
                    name = @Name
                WHERE AdminID = @AdminID
            `;
    
            const result = await request.query(query);
            // console.log(result);
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('Error updating admin details:', err.message);
            throw new Error('Error updating admin details: ' + err.message);
        }
    }
    
    async getDetails(id) {
        // console.log(`Route: POST admin model /profile - Get all Details for id: ${id}`);
        // console.log('Getting details:', id);
        try {
            const pool = await this.db; 
            const request = pool.request();
            request.input('AdminID', sql.Int, id); 
    
            const query = `
                SELECT 
                    AdminID,
                    name,
                    email,
                    password
                FROM 
                    admin
                WHERE 
                    AdminID = @AdminID
            `;
    
            const result = await request.query(query);
            // console.log(result);
            if (result.recordset.length === 0) {
                throw new Error('Admin not found');
            }
    
            const adminDetails = result.recordset[0];
    
            return adminDetails;
        } catch (err) {
            console.error('Error fetching admin details:', err.message);
            throw new Error('Error fetching admin details: ' + err.message);
        }
    }
    
    async changePassword(id, oldPassword, newPassword) {
        // console.log('Changing password for:', id);
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('AdminID', sql.Int, id);

            const getPasswordQuery = `
                SELECT password
                FROM admin
                WHERE AdminID = @AdminID
            `;
            const result = await request.query(getPasswordQuery);
            if (result.recordset.length === 0) {
                return { success: false, message: 'Admin not found' };
            }
            const hashedPassword = result.recordset[0].password;

            // Compare old password with hashed password
            
            // if(hashedPassword != oldPassword) 
            // {
            //     return { success: false, message: 'Old password is incorrect' };

            // }
            
            const passwordMatch = await bcrypt.compare(oldPassword, hashedPassword);
            if (!passwordMatch) {
                return { success: false, message: 'Old password is incorrect' };
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

            const updatePasswordQuery = `
                UPDATE admin
                SET password = @NewPassword
                WHERE AdminID = @AdminID
            `;
            request.input('NewPassword', sql.NVarChar, hashedNewPassword);
            const updateResult = await request.query(updatePasswordQuery);

            // console.log(updateResult);
            return { success: updateResult.rowsAffected[0] > 0, message: 'Password changed successfully' };
        } catch (err) {
            console.error('Error changing password:', err.message);
            throw new Error('Error changing password: ' + err.message);
        }
    }

}

module.exports = AdminModel;
