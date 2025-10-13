// database.js - Version CommonJS
const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT) || 1433,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

let pool;

const connectToDB = async () => {
    try {
        pool = await sql.connect(dbConfig);
        console.log('✅ Connexion à SQL Server réussie!');
        return pool;
    } catch (err) {
        console.error('❌ Erreur de connexion à la base de données:', err.message);
        process.exit(1);
    }
};

const getPool = () => {
    if (!pool) {
        throw new Error('Database not initialized');
    }
    return pool;
};

module.exports = { connectToDB, getPool, sql };