const { Pool } = require('pg');
require('dotenv').config();
const dns = require('dns');

// Force IPv4 resolution - critical for Render
dns.setDefaultResultOrder('ipv4first');

// Determine SSL configuration
let sslConfig = false;
if (process.env.DB_SSL === 'true' || process.env.DATABASE_URL) {
  sslConfig = {
    rejectUnauthorized: false
  };
}

// Build pool config
let poolConfig = {
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
  keepAlives: true,
  keepAliveInitialDelayMillis: 10000,
  statement_timeout: 30000,
  query_timeout: 30000,
};

// Use individual parameters if available (more reliable than connection string)
if (process.env.DB_HOST) {
  poolConfig.host = process.env.DB_HOST;
  poolConfig.user = process.env.DB_USER || 'postgres';
  poolConfig.password = process.env.DB_PASSWORD || '';
  poolConfig.database = process.env.DB_NAME || 'nic_portal';
  poolConfig.port = process.env.DB_PORT || 5432;
  poolConfig.ssl = sslConfig;
  poolConfig.family = 4;  // Force IPv4 only
  poolConfig.hints = dns.ADDRCONFIG | dns.V4MAPPED;  // Additional IPv4 hints
} else if (process.env.DATABASE_URL) {
  // Fallback to connection string if individual params not available
  poolConfig.connectionString = process.env.DATABASE_URL;
  poolConfig.ssl = sslConfig;
} else {
  // Default to localhost
  poolConfig.host = 'localhost';
  poolConfig.user = 'postgres';
  poolConfig.password = '';
  poolConfig.database = 'nic_portal';
  poolConfig.port = 5432;
  poolConfig.ssl = false;
}

const pool = new Pool(poolConfig);

// Test connection on first query, not on startup
let connectionTested = false;

pool.on('connect', () => {
  if (!connectionTested) {
    connectionTested = true;
    console.log('✓ Database connected successfully');
    console.log(`✓ Host: ${poolConfig.host}`);
  }
});

pool.on('error', (err) => {
  console.error('✗ Database connection error:', err.message);
});

module.exports = pool;
