/**
 * Database Connection Pool Configuration using pg (node-postgres)
 * Supports Supabase PostgreSQL Connection Strings & Vercel Serverless
 */

const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

const config = connectionString
  ? {
      connectionString,
      ssl: { rejectUnauthorized: false }
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'stokcerdas_db',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    };

const pgPool = new Pool(config);

// Helper function to translate MySQL-style (?) placeholders to PostgreSQL ($1, $2, ...)
function convertPlaceholders(sql) {
  if (typeof sql !== 'string') return sql;
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

// Wrapper to provide mysql2 compatible async/await interface for Express routes
const pool = {
  async query(sql, params = []) {
    const convertedSql = convertPlaceholders(sql);
    const result = await pgPool.query(convertedSql, params);
    return [result.rows, result];
  },
  async getConnection() {
    const client = await pgPool.connect();
    return {
      async query(sql, params = []) {
        const convertedSql = convertPlaceholders(sql);
        const result = await client.query(convertedSql, params);
        return [result.rows, result];
      },
      async beginTransaction() {
        await client.query('BEGIN');
      },
      async commit() {
        await client.query('COMMIT');
      },
      async rollback() {
        await client.query('ROLLBACK');
      },
      release() {
        client.release();
      }
    };
  }
};

// Test database connection
async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL database (Supabase)');
    return true;
  } catch (err) {
    console.warn('⚠️ Warning: Gagal terhubung ke PostgreSQL database:', err.message);
    console.warn('💡 Pastikan URL / credential database Supabase sudah diatur di Environment Variables (DATABASE_URL).');
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
