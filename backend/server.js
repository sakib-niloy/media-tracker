const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'media_tracker',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to database');
});

// Registration endpoint
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], (err, results) => {
      if (err) {
        console.error('Database insert error:', err);
        return res.status(500).send('Registration failed');
      }
      res.status(201).send('User registered successfully');
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('Registration failed');
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch user from database
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).send('Server error');
      }

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
    });
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


// Delete movie endpoint
app.delete('/movies/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM movies WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error deleting movie:', err);
      return res.status(500).send('Server error');
    }
    res.status(200).send('Movie deleted successfully');
  });
});

// Update movie endpoint
app.put('/movies/:id', (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  db.query('UPDATE movies SET title = ? WHERE id = ?', [title, id], (err, results) => {
    if (err) {
      console.error('Error updating movie:', err);
      return res.status(500).send('Server error');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Movie not found');
    }
    res.status(200).send('Movie updated successfully');
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

// Delete series endpoint
app.delete('/series/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM series WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error deleting series:', err);
      return res.status(500).send('Server error');
    }
    res.status(200).send('Series deleted successfully');
  });
});

// Update series endpoint
app.put('/series/:id', (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  db.query('UPDATE series SET title = ? WHERE id = ?', [title, id], (err, results) => {
    if (err) {
      console.error('Error updating series:', err);
      return res.status(500).send('Server error');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Series not found');
    }
    res.status(200).send('Series updated successfully');
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


// Delete game endpoint
app.delete('/games/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM games WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error deleting game:', err);
      return res.status(500).send('Server error');
    }
    res.status(200).send('Game deleted successfully');
  });
});

// Update game endpoint
app.put('/games/:id', (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  db.query('UPDATE games SET title = ? WHERE id = ?', [title, id], (err, results) => {
    if (err) {
      console.error('Error updating game:', err);
      return res.status(500).send('Server error');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Game not found');
    }
    res.status(200).send('Game updated successfully');
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


// Delete anime endpoint
app.delete('/animes/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM animes WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error deleting anime:', err);
      return res.status(500).send('Server error');
    }
    res.status(200).send('Anime deleted successfully');
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
