require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const { connectToDatabase } = require('./db');
const cors = require("cors");
const http = require("http");


const adminRoutes = require('./routes/adminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const companyRoutes = require('./routes/companyRoutes');
const companyPersonRoutes = require('./routes/companyPersonRoutes');
const cargoRatesRoutes = require('./routes/cargoRatesRoutes');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingFormRoutes');
const schedulesRoute = require('./routes/schedulesRoute');
const regionsRoute = require('./routes/regionsRoute');
const aircraftRoute = require('./routes/aircraftRouter');
const allotmentRoute = require('./routes/allotmentRoutes');
const employeePermissionRoute=require('./routes/employeePermission');
const regionsConnections=require('./routes/regionConnectionRoute');
const reportersRoute = require('./routes/reportRoutes'); 
const statsRoute = require('./routes/statsRoute');
const regionSettingsRoute = require('./routes/regionsRoute2');
// Middleware
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use('/admin',adminRoutes);
app.use('/employee',employeeRoutes);
app.use('/companies',companyRoutes);
app.use('/company-person', companyPersonRoutes);
app.use('/cargoRates',cargoRatesRoutes);
app.use('/auth',authRoutes);
app.use('/book', bookingRoutes);
app.use('/schedule', schedulesRoute);
app.use('/regions', regionsRoute);
app.use('/regions-setting', regionSettingsRoute);
app.use('/regions-second', regionsRoute);
app.use('/aircraft', aircraftRoute);
app.use('/allot', allotmentRoute);
app.use('/employeePermission', employeePermissionRoute);
app.use('/connections', regionsConnections);
app.use('/reports', reportersRoute);
app.use('/stats', statsRoute);


const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; 
console.log(`Node.js version: ${process.version}`);


process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
  process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });  


console.log(process.version);


connectToDatabase().then(pool => {
    app.locals.db = pool;

    app.listen(PORT, HOST, () => {
        console.log(`Server running at http://${HOST}:${PORT}/`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});