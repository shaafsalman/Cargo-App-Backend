require('dotenv').config();
const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, 
    port: parseInt(process.env.DB_PORT), // port number
    database: process.env.DB_DATABASE,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true', // Convert to boolean
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' // Convert to boolean
    }
};

async function connectToDatabase() {
    try {
        await sql.connect(config);
        console.log('Connected to the database!');
        
        // Example query
        const result = await sql.query`SELECT * FROM your_table_name`;
        console.log(result);
        
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

connectToDatabase();
