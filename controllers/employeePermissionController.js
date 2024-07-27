const bcrypt = require('bcrypt');
const employeePermissionModel = require('../models/employeePermissionModel');
const { connectToDatabase } = require('../db');

const saltRounds = parseInt(process.env.SALT) || 10;

let employeeModel;

connectToDatabase()
    .then(pool => {
        employeeModel = new employeePermissionModel(pool);
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