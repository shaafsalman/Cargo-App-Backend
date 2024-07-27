const bcrypt = require('bcrypt');
const sql = require('mssql');

const saltRounds = parseInt(process.env.SALT) || 10;


class EmployeePermissionModel {
    constructor(db) {
        this.db = db;
        let value;
    }
    
    async getAllEmployees() {
        try {
          const pool = await this.db;
          const request = pool.request();
          const query = `
            SELECT e.employee_id, e.manageEmployee, e.manageCustomer, e.manageUser, e.manageCargo, e.manageSchedule, e.manageAircraft, e.manageBooking 
            FROM employeePermission e
          `;
          const result = await request.query(query);
          return result.recordset;
        } catch (err) {
          console.error('Error in getAllEmployees:', err);
          throw new Error('Error fetching employees: ' + err.message);
        }
      }
}

module.exports = EmployeePermissionModel;