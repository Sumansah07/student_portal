const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nic_portal',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.connect()
  .then(client => {
    console.log('✓ Database connected successfully');
    client.release();
  })
  .catch(err => {
    console.error('✗ Database connection failed:', err.message);
  });

module.exports = pool;
