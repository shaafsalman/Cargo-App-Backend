const bcrypt = require('bcrypt');
const EmployeeModel = require('../models/employeeModel');
const { connectToDatabase } = require('../db');

const saltRounds = parseInt(process.env.SALT) || 10;

let employeeModel;

connectToDatabase()
    .then(pool => {
        employeeModel = new EmployeeModel(pool);
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await employeeModel.getAllEmployees();

        if (!employees || employees.length === 0) {
            return res.status(404).json({ error: 'No employees found' });
        }

        res.json(employees);
    } catch (err) {
        console.error('Error fetching all employees:', err);

        if (err instanceof TypeError) {
            return res.status(400).json({ error: 'Invalid data received' });
        } else if (err.name === 'DatabaseError') {
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }

        res.status(500).json({ error: 'Error fetching employees: ' + err.message });
    }
};

exports.createEmployee = async (employeeData) => {
    try {
        
        console.log('Received employee data:', employeeData);

        const { name, email, RegionID,region, password, status,permissions } = employeeData;

        // if (!name || !email || !password || !status) {
        //     return false;
        // }

        // const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newEmployeeData = {
            name,
            email,
            RegionID,
            password,
            region,
            permissions,
            created_at: new Date(),
            updated_at: new Date(),
            password_reset_token: null,
            groupid: null,
            customerid: null,
            remember_token: null,
            email_verified_at: new Date(),
            status
        };

        console.log('New employee data:', newEmployeeData);

        const result1 = await employeeModel.createEmployee(newEmployeeData);
        const result2 = await employeeModel.createEmployeePermission(result1,newEmployeeData);
        return result1;
    } catch (err) {
        console.error('Error in createEmployee function:', err.message);
        throw err;
    }
};
exports.updateEmployee = async (employeeId, newData) => {
    try {
        console.log("in controller");
        console.log(newData);
        // Destructure the newData object to get the updated fields
        const { name, email, RegionID, password, status, region, permissions } = newData;

        console.log(newData);

        // Validate required fields

        const existingEmployee = await employeeModel.getEmployeeById(employeeId);
        if (!existingEmployee) {
            throw new Error(`Employee with ID ${employeeId} not found.`);
        }

        // Update only the fields that are provided in newData
        const updatedEmployeeData = {
            name,
            email,
            password,
            RegionID,
            status,
            region, 
            permissions,
            updated_at: new Date() // Update the updated_at timestamp
        };

        // Call the model function to update admin details
        const result = await employeeModel.updateEmployee(employeeId, updatedEmployeeData);
        const result2 = await employeeModel.updateEmployeePermission(employeeId,updatedEmployeeData);
        return result; // Return the result of the update operation (true/false or any relevant data)
    } catch (err) {
        console.error('Error in updateEmployee function:', err.message);
        throw err; // Throw the error to be caught by the calling function or middleware
    }
};
exports.deleteEmployee = async (employeeId) => {
    try {
        const result = await employeeModel.deleteEmployee(employeeId);
        return result;
    } catch (err) {
        console.error(`Error in deleteEmployee controller: ${err.message}`);
        throw err;
    }
};

exports.getEmployeeById = async (req, res) => {
    const { id } = req.params;
    try {
        const employee = await employeeModel.getEmployeeById(id);
        if (employee) {
            res.json(employee);
        } else {
            res.status(404).json({ error: 'Employee not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.activateEmployee = async (employeeId) => {
    try {
        const result = await employeeModel.activateEmployee(employeeId);
        return result;
    } catch (err) {
        console.error(`Error in activateEmployee controller: ${err.message}`);
        throw err;
    }
};

exports.deactivateEmployee = async (employeeId) => {
    try {
        const result = await employeeModel.deactivateEmployee(employeeId);
        return result;
    } catch (err) {
        console.error(`Error in deactivateEmployee controller: ${err.message}`);
        throw err;
    }
};
