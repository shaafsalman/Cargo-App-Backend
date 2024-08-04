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
        console.log("here1");
        const pool = await this.db;
        const request = pool.request();
        const query = `
          SELECT e.employee_id, e.manageEmployee, e.manageCustomer, e.manageUser, e.manageCargo, e.manageSchedule, e.manageAircraft, e.manageBooking,
            e.manageAllocation, e.manageDeparture, e.manageArrival, e.manageDelivery, e.manageManifest,
            e.manageBR, e.manageCR, e.managePerformance, e.manageAWBPrinting, e.manageLabelPrinting, e.manageDashboard, e.manageFinance, e.manageLog
            FROM employeePermission e
        `;
        const result = await request.query(query);
        return result.recordset;
      } catch (err) {
        console.error('Error in getAllEmployees:', err);
        throw new Error('Error fetching employees: ' + err.message);
      }
    }
    
    async getEmployeeById(id) {
        try {
          console.log("here");
          const pool = await this.db;
          const request = pool.request();
          const query = `
            SELECT e.employee_id, e.manageEmployee, e.manageCustomer, e.manageUser, e.manageCargo, e.manageSchedule, e.manageAircraft, e.manageBooking,
            e.manageAllocation, e.manageDeparture, e.manageArrival, e.manageDelivery, e.manageManifest,
            e.manageBR, e.manageCR, e.managePerformance, e.manageAWBPrinting, e.manageLabelPrinting, e.manageDashboard, e.manageFinance, e.manageLog
            FROM employeePermission e
            where employee_id=@id
          `;
          request.input('id', sql.Int, id);
          const result = await request.query(query);
          return result.recordset;
        } catch (err) {
          console.error('Error in getAllEmployees:', err);
          throw new Error('Error fetching employees: ' + err.message);
        }
      }
}

module.exports = EmployeePermissionModel;