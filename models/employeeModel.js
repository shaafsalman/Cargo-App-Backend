const bcrypt = require('bcrypt');
const sql = require('mssql');
const AccountEmailSender = require('./../Utility/AccountEmailSender');
const saltRounds = parseInt(process.env.SALT) || 10;


class EmployeeModel {
    constructor(db) {
        this.db = db;
        let value;
    }
    
    async getAllEmployees() {
        try {
          const pool = await this.db;
          const request = pool.request();
          const query = `
            SELECT e.employeeid, e.name, e.email, e.RegionID, e.Deactive AS status, r.RegionName
            FROM employee e
            INNER JOIN region r ON e.RegionID = r.RegionID
          `;
          const result = await request.query(query);
          return result.recordset;
        } catch (err) {
          console.error('Error in getAllEmployees:', err);
          throw new Error('Error fetching employees: ' + err.message);
        }
      }
      
    async getEmployeeById(employeeId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('employeeId', sql.Int, employeeId);
            const query = 'SELECT * FROM employee WHERE EmployeeID = @employeeId';
            const result = await request.query(query);
            return result.recordset[0];
        } catch (err) {
            throw new Error('Error fetching employee by ID: ' + err.message);
        }
    }

    async updateEmployeePermission(employeeID, employeeData) {
        const { permissions } = employeeData;
    
        try {
            // Determine the permission values
            let employeeTemp = permissions.includes("Allow to manage employees") ? 1 : 0;
            let customerTemp = permissions.includes("Allow to manage customer") ? 1 : 0;
            let userTemp = permissions.includes("Allow to manage user") ? 1 : 0;
            let cargoTemp = permissions.includes("Allow to manage cargoRate") ? 1 : 0;
            let scheduleTemp = permissions.includes("Allow to manage schedule") ? 1 : 0;
            let aircraftTemp = permissions.includes("Allow to manage aircraft") ? 1 : 0;
            let bookingTemp = permissions.includes("Allow to manage booking") ? 1 : 0;
            let allocationTemp = permissions.includes("Allow to manage allocation") ? 1 : 0;
            let departureTemp = permissions.includes("Allow to manage departure") ? 1 : 0;
            let arrivalTemp = permissions.includes("Allow to manage arrival") ? 1 : 0;
            let deliveryTemp = permissions.includes("Allow to manage delivery") ? 1 : 0;
            let manifestTemp = permissions.includes("Allow to manage flight Manifest") ? 1 : 0;
            let bookingReportTemp = permissions.includes("Allow to manage booking Report") ? 1 : 0;
            let customerReportTemp = permissions.includes("Allow to manage customer Report") ? 1 : 0;
            let flightPerformanceTemp = permissions.includes("Allow to manage flight Performance") ? 1 : 0;
            let awbPrintingTemp = permissions.includes("Allow to manage awb Printing") ? 1 : 0;
            let labelPrintingTemp = permissions.includes("Allow to manage label Printing") ? 1 : 0;
            let dashboardTemp = permissions.includes("Allow to see dashboard") ? 1 : 0;
            let financeTemp = permissions.includes("Allow to manage finance Report") ? 1 : 0;
            let logTemp = permissions.includes("Allow to manage logs Report") ? 1 : 0;

            
    
            const pool = await this.db;
            const request = pool.request();

            request.input('employeeid', sql.Int, employeeID);
            request.input('manageEmployee', sql.Int, employeeTemp);
            request.input('manageCustomer', sql.Int, customerTemp);
            request.input('manageUser', sql.Int, userTemp);
            request.input('manageCargo', sql.Int, cargoTemp);
            request.input('manageSchedule', sql.Int, scheduleTemp);
            request.input('manageAircraft', sql.Int, aircraftTemp);
            request.input('manageBooking', sql.Int, bookingTemp);
            request.input('manageAllocation', sql.Int, allocationTemp);
            request.input('manageDeparture', sql.Int, departureTemp);
            request.input('manageArrival', sql.Int, arrivalTemp);
            request.input('manageDelivery', sql.Int, deliveryTemp);
            request.input('manageManifest', sql.Int, manifestTemp);
            request.input('manageBR', sql.Int, bookingReportTemp);
            request.input('manageCR', sql.Int, customerReportTemp);
            request.input('managePerformance', sql.Int, flightPerformanceTemp);
            request.input('manageAWBPrinting', sql.Int, awbPrintingTemp);
            request.input('manageLabelPrinting', sql.Int, labelPrintingTemp);
            request.input('manageDashboard', sql.Int, dashboardTemp);
            request.input('manageFinance', sql.Int, financeTemp);
            request.input('manageLog', sql.Int, logTemp);

    
            const query = `
                UPDATE employeePermission
                SET 
                    manageEmployee = @manageEmployee,
                    manageCustomer = @manageCustomer,
                    manageUser = @manageUser,
                    manageCargo = @manageCargo,
                    manageSchedule = @manageSchedule,
                    manageAircraft = @manageAircraft,
                    manageBooking = @manageBooking,
                    manageAllocation = @manageAllocation,
                    manageDeparture=@manageDeparture,
                    manageArrival=@manageArrival,
                    manageDelivery=@manageDelivery,
                     manageManifest=@manageManifest,
                     manageBR=@manageBR,
                    manageCR=@manageCR,
                    managePerformance=@managePerformance,
                    manageAWBPrinting=@manageAWBPrinting,
                     manageLabelPrinting=@manageLabelPrinting ,
                     manageDashboard=@manageDashboard,
                     manageFinance=@manageFinance,
                     manageLog=@manageLog
                WHERE employee_id = @employeeid
            `;
    
            const result = await request.query(query);
            if (result.rowsAffected.length > 0) {
                return { message: 'Employee permissions updated successfully' };
            } else {
                throw new Error('Error updating employee permissions: No records updated');
            }
        } catch (err) {
            console.error('Error updating employee:', err.message);
            throw new Error(err.message);
        }
    }
    

    async createEmployee(employeeData) {
        console.log("in model");
        const { name, email, RegionID, password, created_at, updated_at, password_reset_token, groupid, customerid, remember_token, email_verified_at, status } = employeeData;
        console.log(employeeData);
        let temp;
        if(status==="active"){
            temp=1;
        }
        else{
            temp=1;
        }
        try {
            console.log("hi from employee create");
            
            const pool = await this.db;
            const request = pool.request();

            request.input('email', sql.NVarChar, email);
            const checkEmailQuery = 'SELECT COUNT(*) as count FROM employee WHERE email = @email';
            const checkEmailResult = await request.query(checkEmailQuery);
            const checkAdmin = 'SELECT COUNT(*) as count FROM admin WHERE email = @email';
            const checkAdminResult = await request.query(checkAdmin);
            const checkCompanyPerson = 'SELECT COUNT(*) as count FROM companyPerson WHERE email = @email';
            const checkCompanyPersonResult = await request.query(checkCompanyPerson);
            const checkCompany = 'SELECT COUNT(*) as count FROM company WHERE email = @email';
            const checkCompanyResult = await request.query(checkCompany);
    
            if (checkEmailResult.recordset[0].count > 0 || checkAdminResult.recordset[0].count > 0 || checkCompanyPersonResult.recordset[0].count > 0 || checkCompanyResult.recordset[0].count > 0) {
                throw new Error('Error creating employee: Email already exists');
            }
            
            const hashedPassword = await bcrypt.hash(password, 10);

            request.input('name', sql.NVarChar, name);
            request.input('RegionID', sql.Int, RegionID);
            request.input('password', sql.NVarChar, hashedPassword);
            request.input('created_at', sql.DateTime, created_at);
            request.input('updated_at', sql.DateTime, updated_at);
            request.input('password_reset_token', sql.NVarChar, password_reset_token);
            request.input('groupid', sql.Int, groupid);
            request.input('customerid', sql.Int, customerid);
            request.input('remember_token', sql.NVarChar, remember_token);
            request.input('email_verified_at', sql.DateTime, email_verified_at);
            request.input('deactive', sql.Int, temp);
            const query = `
                INSERT INTO employee (name, email, RegionID, password, created_at, updated_at, password_reset_token, groupid, customerid, remember_token, email_verified_at, deactive)
                OUTPUT INSERTED.EmployeeID
                VALUES (@name, @email, @RegionID, @password, @created_at, @updated_at, 
                        @password_reset_token, @groupid, @customerid, @remember_token, 
                        @email_verified_at, @deactive)
            `;

            const result = await request.query(query);
        if (result.recordset.length > 0) {
            AccountEmailSender(email, name, password, "Employee");
            return result.recordset[0].EmployeeID; 
        } else {
            throw new Error('Error creating employee: No records inserted');
        }
        } catch (err) {
            console.error('Error creating employee:', err.message);
            throw new Error(err.message);
        }
    }

    async createEmployeePermission(employeeID,employeeData) {
        const { permissions } = employeeData;
    
        try {
            // Call createEmployee method to get the EmployeeID
            // const employeeID = await this.createEmployee(employeeData);
    
            // Determine the permission values
            let employeeTemp = permissions.includes("Allow to manage employees") ? 1 : 0;
            let customerTemp = permissions.includes("Allow to manage customer") ? 1 : 0;
            let userTemp = permissions.includes("Allow to manage user") ? 1 : 0;
            let cargoTemp = permissions.includes("Allow to manage cargoRate") ? 1 : 0;
            let scheduleTemp = permissions.includes("Allow to manage schedule") ? 1 : 0;
            let aircraftTemp = permissions.includes("Allow to manage aircraft") ? 1 : 0;
            let bookingTemp = permissions.includes("Allow to manage booking") ? 1 : 0;
            let allocationTemp = permissions.includes("Allow to manage allocation") ? 1 : 0;
            let departureTemp = permissions.includes("Allow to manage departure") ? 1 : 0;
            let arrivalTemp = permissions.includes("Allow to manage arrival") ? 1 : 0;
            let deliveryTemp = permissions.includes("Allow to manage delivery") ? 1 : 0;
            let manifestTemp = permissions.includes("Allow to manage flight Manifest") ? 1 : 0;
            let bookingReportTemp = permissions.includes("Allow to manage booking Report") ? 1 : 0;
            let customerReportTemp = permissions.includes("Allow to manage customer Report") ? 1 : 0;
            let flightPerformanceTemp = permissions.includes("Allow to manage flight Performance") ? 1 : 0;
            let awbPrintingTemp = permissions.includes("Allow to manage awb Printing") ? 1 : 0;
            let labelPrintingTemp = permissions.includes("Allow to manage label Printing") ? 1 : 0;
            let dashboardTemp = permissions.includes("Allow to see dashboard") ? 1 : 0;
            let financeTemp = permissions.includes("Allow to manage finance Report") ? 1 : 0;
            let logTemp = permissions.includes("Allow to manage logs Report") ? 1 : 0;

    
            const pool = await this.db;
            const request = pool.request();
    
            request.input('employeeid', sql.Int, employeeID); 
            request.input('manageEmployee', sql.Int, employeeTemp);
            request.input('manageCustomer', sql.Int, customerTemp);
            request.input('manageUser', sql.Int, userTemp);
            request.input('manageCargo', sql.Int, cargoTemp);
            request.input('manageSchedule', sql.Int, scheduleTemp);
            request.input('manageAircraft', sql.Int, aircraftTemp);
            request.input('manageBooking', sql.Int, bookingTemp);
            request.input('manageAllocation', sql.Int, allocationTemp);
            request.input('manageDeparture', sql.Int, departureTemp);
            request.input('manageArrival', sql.Int, arrivalTemp);
            request.input('manageDelivery', sql.Int, deliveryTemp);
            request.input('manageManifest', sql.Int, manifestTemp);
            request.input('manageBR', sql.Int, bookingReportTemp);
            request.input('manageCR', sql.Int, customerReportTemp);
            request.input('managePerformance', sql.Int, flightPerformanceTemp);
            request.input('manageAWBPrinting', sql.Int, awbPrintingTemp);
            request.input('manageLabelPrinting', sql.Int, labelPrintingTemp);
            request.input('manageDashboard', sql.Int, dashboardTemp);
            request.input('manageFinance', sql.Int, financeTemp);
            request.input('manageLog', sql.Int, logTemp);




            console.log(employeeID);
            const query = `
                INSERT INTO employeePermission (employee_id, manageEmployee, manageCustomer, manageUser, manageCargo, manageSchedule, manageAircraft, manageBooking, manageAllocation,manageDeparture,manageArrival,manageDelivery, manageManifest,manageBR, manageCR,managePerformance,manageAWBPrinting, manageLabelPrinting,manageDashboard, manageFinance, manageLog )
                OUTPUT INSERTED.Employee_ID
                VALUES (@employeeid, @manageEmployee, @manageCustomer, @manageUser, @manageCargo, @manageSchedule, @manageAircraft, @manageBooking ,@manageAllocation, @manageDeparture, @manageArrival, @manageDelivery, @manageManifest, @manageBR, @manageCR, @managePerformance, @manageAWBPrinting, @manageLabelPrinting, @manageDashboard, @manageFinance,@manageLog)
            `;
    
            const result = await request.query(query);
            if (result.recordset.length > 0) {
                return result.recordset[0]; // Return whatever is needed from this insertion
            } else {
                throw new Error('Error creating employee permission: No records inserted');
            }
        } catch (err) {
            console.error('Error creating employee permission:', err.message);
            throw new Error('Error creating employee permission: ' + err.message);
        }
    }    

    async updateEmployee(employeeId, updatedEmployeeData) {
        const { name, email, status, password, RegionID } = updatedEmployeeData;
        console.log(updatedEmployeeData);
        
        try {
            console.log("here in model");
            // console.log(region);
            const pool = await this.db;
            const request = pool.request();
            const hashedPassword = await bcrypt.hash(password, 10);
            let temp = status === true || status === 'active' || status === 'Active' ? 1 : 0;

            request.input('employeeId', sql.Int, employeeId);
            request.input('email', sql.NVarChar, email);
            const checkEmailQuery = 'SELECT COUNT(*) as count FROM employee WHERE email = @email AND employeeid != @employeeid';
            const checkEmailResult = await request.query(checkEmailQuery);
            const checkAdmin = 'SELECT COUNT(*) as count FROM admin WHERE email = @email';
            const checkAdminResult = await request.query(checkAdmin);
            const checkCompanyPerson = 'SELECT COUNT(*) as count FROM companyPerson WHERE email = @email';
            const checkCompanyPersonResult = await request.query(checkCompanyPerson);
            const checkCompany = 'SELECT COUNT(*) as count FROM company WHERE email = @email';
            const checkCompanyResult = await request.query(checkCompany);
    
            if (checkEmailResult.recordset[0].count > 0 || checkAdminResult.recordset[0].count > 0 || checkCompanyPersonResult.recordset[0].count > 0 || checkCompanyResult.recordset[0].count > 0) {
                throw new Error('Error updating employee: Email already exists');
            }

            // request.input('employeeId', sql.Int, employeeId);
            request.input('name', sql.NVarChar, name);
            // request.input('email', sql.NVarChar, email);
            request.input('RegionID', sql.Int, RegionID);
            request.input('password', sql.NVarChar, hashedPassword);
            request.input('deactive', sql.Int, temp);
            request.input('updated_at', sql.DateTime, new Date());

            const query = `
                UPDATE employee
                SET name = @name,
                    email = @email,
                    RegionID = @RegionID,
                    password = @password,
                    deactive = @deactive,
                    updated_at = @updated_at
                WHERE EmployeeID = @employeeId;
            `;

            const result = await request.query(query);
            if (result.rowsAffected[0] > 0) {
                return true;
            } else {
                throw new Error(`Employee with ID ${employeeId} not found or no changes made.`);
            }
        } catch (err) {
            console.error('Error updating employee:', err.message);
            throw new Error(err.message);
        }
    }

    async deleteEmployee(employeeId) {
        console.log('Deleting employee from model ' + employeeId);
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('employeeId', sql.Int, employeeId);
            const query2 = 'DELETE FROM employeePermission WHERE employee_id = @employeeId';
            const query = 'DELETE FROM employee WHERE EmployeeID = @employeeId';
            const result = await request.query(query);
            const result2 = await request.query(query2);
            console.log(result);
            console.log(result2);
            return result.rowsAffected > 0;
        } catch (err) {
            throw new Error('Error deleting employee: ' + err.message);
        }
    }

    async activateEmployee(employeeId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('employeeId', sql.Int, employeeId);
            const query = 'UPDATE employee SET Deactive = 1 WHERE EmployeeID = @employeeId';
            await request.query(query);
            return true;
        } catch (err) {
            throw new Error('Error activating employee: ' + err.message);
        }
    }

    async deactivateEmployee(employeeId) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('employeeId', sql.Int, employeeId);
            const query = 'UPDATE employee SET Deactive = 0 WHERE EmployeeID = @employeeId';
            await request.query(query);
            return true;
        } catch (err) {
            throw new Error('Error deactivating employee: ' + err.message);
        }
    }

    async findByEmail(email) {
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('email', sql.NVarChar, email);
            const query = 'SELECT * FROM employee WHERE email = @email';
            const result = await request.query(query);
            return result.recordset[0];
        } catch (err) {
            throw new Error('Error fetching employee by email: ' + err.message);
        }
    }
     
    async getDetails(id) {
        // console.log(`Route: POST employee model /profile - Get all Details for id: ${id}`);
        // console.log('Getting details:', id);
        try {
            const pool = await this.db; 
            const request = pool.request();
            request.input('EmployeeID', sql.Int, id); 
    
            const query = `
                SELECT 
                EmployeeID,
                    name,
                    email,
                    password
                FROM 
                    employee
                WHERE 
                EmployeeID = @EmployeeID
            `;
    
            const result = await request.query(query);
            // console.log(result);
            if (result.recordset.length === 0) {
                throw new Error('Employee not found');
            }
    
            const employeeDetails = result.recordset[0];
    
            return employeeDetails;
        } catch (err) {
            console.error('Error fetching employee details:', err.message);
            throw new Error('Error fetching employee details: ' + err.message);
        }
    }
    
    async changePassword(id, oldPassword, newPassword) {
        // console.log('Changing password for:', id);
        try {
            const pool = await this.db;
            const request = pool.request();
            request.input('EmployeeID', sql.Int, id);

            const getPasswordQuery = `
                SELECT password
                FROM employee
                WHERE EmployeeID = @EmployeeID
            `;
            const result = await request.query(getPasswordQuery);
            if (result.recordset.length === 0) {
                return { success: false, message: 'Employee not found' };
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
                UPDATE employee
                SET password = @NewPassword
                WHERE EmployeeID = @EmployeeID
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
    async updateCustomerDetails(id, name, email) {
        // console.log('Updating admin details:', id);
        try {
            const pool = await this.db; 
            const request = pool.request();
            request.input('EmployeeID', sql.Int, id);
            request.input('Name', sql.NVarChar, name);
            request.input('Email', sql.NVarChar, email);
    
            const query = `
                UPDATE employee
                SET 
                    name = @Name
                WHERE EmployeeID = @EmployeeID
            `;
    
            const result = await request.query(query);
            // console.log(result);
            return result.rowsAffected[0] > 0;
        } catch (err) {
            console.error('Error updating employee details:', err.message);
            throw new Error('Error updating employee details: ' + err.message);
        }
    }
    async getEmployeesRegion(employeeId) {
        try {
          const pool = await this.db;
          const request = pool.request();
          const query = `
            SELECT e.RegionID, r.RegionName
            FROM employee e
            INNER JOIN region r ON e.RegionID = r.RegionID
            WHERE e.employeeid = @employeeId
          `;
          request.input('employeeId', employeeId); // Add the employeeId parameter
          const result = await request.query(query);
          return result.recordset;
        } catch (err) {
          console.error('Error in getEmployeesRegion:', err);
          throw new Error('Error fetching employee region: ' + err.message);
        }
      }
      

}

module.exports = EmployeeModel;