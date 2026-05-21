const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD, 
});

pool.connect()
    .then(() => console.log('Connected to the database.'))
    .catch((err) => console.log('Database connection error: ', err));

module.exports = pool;