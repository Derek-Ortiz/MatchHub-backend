const { Pool } = require('pg');
const env = require('./env');

const useSsl = String(env.DB_SSL).toLowerCase() === 'true';
const rejectUnauthorized = String(env.DB_SSL_REJECT_UNAUTHORIZED).toLowerCase() === 'true';

const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  ssl: useSsl ? { rejectUnauthorized } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle DB client:', err.message);
});

const query = (text, params) => pool.query(text, params);
const getClient = () => pool.connect();

module.exports = { query, getClient, pool };