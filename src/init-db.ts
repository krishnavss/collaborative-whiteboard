import pool from './db';

const createTableQuery = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

async function initializeDatabase() {
  try {
    await pool.query(createTableQuery);
    console.log('Database table "users" initialized successfully.');
  } catch (err) {
    console.error('Error initializing database table:', err);
  } finally {
    // End the pool connection so the script exits
    await pool.end();
  }
}

initializeDatabase();

