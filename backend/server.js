const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// Middleware setup
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'media_tracker',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Connected to database');
});

// Registration endpoint
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the email already exists
        const [results] = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
                if (err) {
                    console.error('Database query error:', err);
                    return reject(err);
                }
                resolve(results);
            });
        });

        console.log('Registration query results:', results); // Debugging line

        if (results.length > 0) {
            return res.status(400).send('Email already registered');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into database
        await new Promise((resolve, reject) => {
            db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], (err, results) => {
                if (err) {
                    console.error('Database insert error:', err);
                    return reject(err);
                }
                resolve(results);
            });
        });

        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Registration failed, please try again');
    }
});


// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch user from database
    const [results] = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    console.log('Login query results:', results); // Debugging line

    if (results.length === 0) {
      return res.status(401).send('Invalid email or password');
    }

    const user = results[0];

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send('Invalid email or password');
    }

    // Create JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, 'your_jwt_secret', { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send('Server error');
  }
});

// Endpoints for Movies
app.get('/movies', (req, res) => {
  db.query('SELECT * FROM movies ORDER BY title ASC', (err, results) => {
    if (err) {
      console.error('Error fetching movies:', err);
      return res.status(500).send('Server error');
    }
    res.json(results);
  });
});

app.post('/movies', (req, res) => {
  const { title } = req.body;
  db.query('INSERT INTO movies (title) VALUES (?)', [title], (err, results) => {
    if (err) {
      console.error('Error adding movie:', err);
      return res.status(500).send('Server error');
    }
    res.status(201).send({ id: results.insertId, title });
  });
});

// Endpoints for Series
app.get('/series', (req, res) => {
  db.query('SELECT * FROM series ORDER BY title ASC', (err, results) => {
    if (err) {
      console.error('Error fetching series:', err);
      return res.status(500).send('Server error');
    }
    res.json(results);
  });
});

app.post('/series', (req, res) => {
  const { title } = req.body;
  db.query('INSERT INTO series (title) VALUES (?)', [title], (err, results) => {
    if (err) {
      console.error('Error adding series:', err);
      return res.status(500).send('Server error');
    }
    res.status(201).send({ id: results.insertId, title });
  });
});

// Endpoints for Games
app.get('/games', (req, res) => {
  db.query('SELECT * FROM games ORDER BY title ASC', (err, results) => {
    if (err) {
      console.error('Error fetching games:', err);
      return res.status(500).send('Server error');
    }
    res.json(results);
  });
});

app.post('/games', (req, res) => {
  const { title } = req.body;
  db.query('INSERT INTO games (title) VALUES (?)', [title], (err, results) => {
    if (err) {
      console.error('Error adding game:', err);
      return res.status(500).send('Server error');
    }
    res.status(201).send({ id: results.insertId, title });
  });
});

// Endpoints for Animes
app.get('/animes', (req, res) => {
  db.query('SELECT * FROM animes ORDER BY title ASC', (err, results) => {
    if (err) {
      console.error('Error fetching animes:', err);
      return res.status(500).send('Server error');
    }
    res.json(results);
  });
});

app.post('/animes', (req, res) => {
  const { title } = req.body;
  db.query('INSERT INTO animes (title) VALUES (?)', [title], (err, results) => {
    if (err) {
      console.error('Error adding anime:', err);
      return res.status(500).send('Server error');
    }
    res.status(201).send({ id: results.insertId, title });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
