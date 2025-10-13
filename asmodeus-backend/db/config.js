import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,   // e.g., "localhost"
  database: process.env.DB_NAME,   // "Asmodeus"
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

export async function connectToDB() {
  try {
    const pool = await sql.connect(config);
    console.log('✅ Connected to SQL Server');
    return pool;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    throw err;
  }
}
