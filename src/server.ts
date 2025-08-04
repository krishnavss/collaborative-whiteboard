import express from 'express';
import pool from './db';
import bcrypt from 'bcrypt';

const app = express();
const port = 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// User registration endpoint
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user into the database
    const newUser = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username, passwordHash]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (err: any) {
    // Check for unique constraint violation (duplicate username)
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Username already exists' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

