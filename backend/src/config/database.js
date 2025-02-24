require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'emprestimos',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Converter pool em promises para usar async/await
const promisePool = pool.promise();

module.exports = promisePool; 