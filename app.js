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
app.use('/aircraft', aircraftRoute);

const PORT = process.env.PORT || 3000;

console.log(process.version);


connectToDatabase().then(pool => {
    app.locals.db = pool;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});