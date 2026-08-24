/**
 * Database Connection Pool Configuration using mysql2/promise
 * Designed for phpMyAdmin / MySQL (Default XAMPP Credentials)
 */

const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'stokcerdas_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database:', dbConfig.database);
    connection.release();
    return true;
  } catch (err) {
    console.warn('⚠️ Warning: Gagal terhubung ke MySQL database:', err.message);
    console.warn('💡 Pastikan MySQL di XAMPP / phpMyAdmin sudah aktif dan database "stokcerdas_db" sudah di-import dari schema.sql.');
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
