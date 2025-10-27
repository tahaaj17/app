const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

exports.register = (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!['admin', 'professor', 'student'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
  db.run(sql, [name, email, hashedPassword, role], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: 'Error creating user' });
    }

    res.status(201).json({
      message: 'User created successfully',
      user: { id: this.lastID, name, email, role }
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.get(sql, [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
};

exports.getProfile = (req, res) => {
  const sql = 'SELECT id, name, email, role, created_at FROM users WHERE id = ?';
  db.get(sql, [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });
};
