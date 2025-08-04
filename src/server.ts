import { authMiddleware, AuthenticatedRequest } from './middleware/auth';
import jwt from 'jsonwebtoken';
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

// User login endpoint
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find the user in the database
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' }); // User not found
    }

    const user = userResult.rows[0];

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' }); // Password incorrect
    }

    // Generate a JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET!, // The '!' asserts that we know this value is defined
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// A protected route to get the current user's profile
app.get('/api/profile', authMiddleware, (req: AuthenticatedRequest, res) => {
  // The authMiddleware has already verified the user and attached the payload
  res.json({
    message: 'Successfully accessed protected route',
    user: req.user
  });
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

