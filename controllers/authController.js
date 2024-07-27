const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AdminModel = require('../models/adminModel');
const EmployeeModel = require('../models/employeeModel');
const CompanyPersonModel = require('../models/companyPersonModel');
const { connectToDatabase } = require('../db');

const secretKey = process.env.JWT_SECRET_KEY || 'pavilion';

let adminModel;
let companyPersonModel;
let employeeModel;

connectToDatabase().then(pool => {
    adminModel = new AdminModel(pool);
    companyPersonModel = new CompanyPersonModel(pool);
    employeeModel = new EmployeeModel(pool);
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});

exports.login = async ({ email, password }) => {
    try {
        console.log('Attempting login with email:', email);

        // Check if it's an admin
        let admin = await adminModel.findByEmail(email);
        if (admin && await bcrypt.compare(password, admin.password)) {
            const token = jwt.sign({
                id: admin.AdminID,
                role: 'admin',
                name: admin.name,
                email: admin.email
            }, secretKey, { expiresIn: '1h' });
            console.log('Admin logged in successfully');
            return { token };
        }

            // Check if it's a company person
            let companyPerson = await companyPersonModel.findByEmail(email);
          
            if (companyPerson && await bcrypt.compare(password, companyPerson.password)) {
                const token = jwt.sign({
                    id: companyPerson.PersonID,
                    role: 'companyPerson',
                    name: companyPerson.name,
                    email: companyPerson.email
                }, secretKey, { expiresIn: '1h' });
                console.log('Company person logged in successfully');
                return { token };
            }

        // Check if it's an employee
        let employee = await employeeModel.findByEmail(email);
        if (employee && await bcrypt.compare(password, employee.password)) {
            const token = jwt.sign({
                id: employee.EmployeeID,
                role: 'employee',
                name: employee.name,
                email: employee.email
            }, secretKey, { expiresIn: '1h' });
            console.log('Employee logged in successfully');
            return { token };
        }

    

        // If no user found with the given email/password
        console.log('Invalid credentials');
        throw new Error('Invalid credentials');
    } catch (error) {
        console.error('Error during login:', error);
        throw new Error('Internal server error');
    }
};





// const jwt = require('jsonwebtoken');
// const AdminModel = require('../models/adminModel');
// const EmployeeModel = require('../models/employeeModel');
// const CompanyPersonModel = require('../models/companyPersonModel');
// const { connectToDatabase } = require('../db');

// const secretKey = process.env.JWT_SECRET_KEY || 'pavilion';

// let adminModel;
// let companyPersonModel;
// let employeeModel;

// connectToDatabase().then(pool => {
//     adminModel = new AdminModel(pool);
//     companyPersonModel = new CompanyPersonModel(pool);
//     employeeModel = new EmployeeModel(pool);
// }).catch(err => {
//     console.error('Unable to connect to the database:', err);
// });

// exports.login = async ({ email, password }) => {
//     try {
//         console.log('Attempting login with email:', email);

//         // Check if it's an admin
//         let admin = await adminModel.findByEmail(email);
//         if (admin && password === admin.password) { // Plain text password comparison
//             const token = jwt.sign({
//                 id: admin.AdminID,
//                 role: 'admin',
//                 name: admin.name,
//                 email: admin.email
//             }, secretKey, { expiresIn: '1h' });
//             console.log('Admin logged in successfully');
//             return { token };
//         }

//         // Check if it's an employee
//         let employee = await employeeModel.findByEmail(email);
//         if (employee && password === employee.password) { // Plain text password comparison
//             const token = jwt.sign({
//                 id: employee.EmployeeID,
//                 role: 'employee',
//                 name: employee.name,
//                 email: employee.email
//             }, secretKey, { expiresIn: '1h' });
//             console.log('Employee logged in successfully');
//             return { token };
//         }

//         // Check if it's a company person
//         let companyPerson = await companyPersonModel.findByEmail(email);
//         if (companyPerson && password === companyPerson.password) { // Plain text password comparison
//             const token = jwt.sign({
//                 id: companyPerson.PersonID,
//                 role: 'companyPerson',
//                 name: companyPerson.name,
//                 email: companyPerson.email
//             }, secretKey, { expiresIn: '1h' });
//             console.log('Company person logged in successfully');
//             return { token };
//         }

//         // If no user found with the given email/password
//         console.log('Invalid credentials');
//         throw new Error('Invalid credentials');
//     } catch (error) {
//         console.error('Error during login:', error);
//         throw new Error('Internal server error');
//     }
// };
