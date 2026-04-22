require('dotenv').config();

const env = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_SSL: process.env.DB_SSL,
  DB_SSL_REJECT_UNAUTHORIZED: process.env.DB_SSL_REJECT_UNAUTHORIZED,

  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
  RAWG_API_KEY: process.env.RAWG_API_KEY,
  RAWG_BASE_URL: process.env.RAWG_BASE_URL,
  DICEBEAR_BASE_URL: process.env.DICEBEAR_BASE_URL,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173'],
};

const required = [
  'DB_HOST', 
  'DB_USER', 
  'DB_PASSWORD', 
  'DB_NAME', 
  'CLERK_SECRET_KEY', 
  'RAWG_API_KEY'
];

for (const key of required) {
  if (!env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = env;