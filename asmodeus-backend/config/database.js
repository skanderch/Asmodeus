import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,   // e.g., "localhost"
  database: process.env.DB_NAME,   // "Asmodeus"
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

let globalPool = null;

export async function connectToDB() {
  try {
    if (!globalPool) {
      globalPool = await sql.connect(config);
      console.log('✅ Connected to SQL Server with connection pool');
    }
    return globalPool;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    globalPool = null;
    throw err;
  }
}

export async function closeDB() {
  if (globalPool) {
    try {
      await globalPool.close();
      globalPool = null;
      console.log('✅ Database connection closed');
    } catch (err) {
      console.error('❌ Error closing database connection:', err.message);
    }
  }
}
