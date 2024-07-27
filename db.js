const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER, 
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' 
  }
};

async function connectToDatabase() {
  try {
    const pool = await sql.connect(config);
    console.log('Connected to the database');
    return pool;
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
}

module.exports = {
  connectToDatabase,
  sql
};
