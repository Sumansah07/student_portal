const { Pool } = require('pg');
require('dotenv').config();
const dns = require('dns');

// CRITICAL FIX: Force IPv4 resolution
// Supabase resolves to IPv6 but Node.js has issues with it
dns.setDefaultResultOrder('ipv4first');

// Determine SSL configuration
let sslConfig = false;
if (process.env.DB_SSL === 'true' || process.env.DATABASE_URL) {
  // Using Supabase - needs SSL with self-signed cert handling
  sslConfig = {
    rejectUnauthorized: false  // Accept self-signed certificates
  };
}

// Build pool config
let poolConfig = {
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlives: true,
  keepAliveInitialDelayMillis: 10000,
};

// Add connection parameters
if (process.env.DATABASE_URL) {
  poolConfig.connectionString = process.env.DATABASE_URL;
  poolConfig.ssl = sslConfig;
} else {
  poolConfig.host = process.env.DB_HOST || 'localhost';
  poolConfig.user = process.env.DB_USER || 'postgres';
  poolConfig.password = process.env.DB_PASSWORD || '';
  poolConfig.database = process.env.DB_NAME || 'nic_portal';
  poolConfig.port = process.env.DB_PORT || 5432;
  poolConfig.ssl = sslConfig;
  poolConfig.family = 4;  // Force IPv4 only
}

const pool = new Pool(poolConfig);

// Test connection on first query, not on startup
let connectionTested = false;

pool.on('connect', () => {
  if (!connectionTested) {
    connectionTested = true;
    console.log('✓ Database connected successfully');
    console.log(`✓ Using ${process.env.DATABASE_URL ? 'Connection String' : 'Individual Parameters'}`);
  }
});

pool.on('error', (err) => {
  console.error('✗ Database connection error:', err.message);
});

module.exports = pool;
