require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET;

//REGISTER

exports.register = async (req, res) => {
  const { student_id, full_name, email, password } = req.body;

  if (!student_id || !full_name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ? OR student_id = ?',
      [email, student_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    await db.execute(
      'INSERT INTO users (student_id, full_name, email, password_hash) VALUES (?, ?, ?, ?)',
      [student_id, full_name, email, password_hash]
    );

    return res.status(201).json({ message: 'Registered successfully' });
  } catch (error) {
    console.error('❌ Registration error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//LOGIN

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }

  try {
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        student_id: user.student_id,
        full_name: user.full_name,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        student_id: user.student_id,
        full_name: user.full_name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
