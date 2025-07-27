require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Missing email or password' });

  try {
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0)
      return res.status(409).json({ message: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO users (email, password_hash) VALUES (?, ?)', [
      email,
      password_hash,
    ]);

    res.status(201).json({ message: 'Registered successfully' });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Missing email or password' });

  try {
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [
      email,
    ]);
    if (users.length === 0)
      return res.status(404).json({ message: 'User not found' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    // Update user online status
    try {
      await db.execute(
        `UPDATE users
         SET last_active = CURRENT_TIMESTAMP, is_online = TRUE
         WHERE id = ?`,
        [user.id]
      );
      console.log(`🟢 User ${user.id} set online`);
    } catch (statusError) {
      console.error('Error updating user status:', statusError);
      // Don't block login if status update fails
    }

    res.cookie('token', token, {
      httpOnly: false,
      secure: false, // đặt true nếu dùng HTTPS
      sameSite: 'Lax',
      maxAge: 60 * 60 * 1000, // 1 giờ
    });

    res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = async (req, res) => {
  // Set user offline if authenticated
  if (req.user && req.user.id) {
    try {
      await db.execute(
        `UPDATE users
         SET is_online = FALSE, last_active = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [req.user.id]
      );
    } catch (statusError) {
      console.error('Error updating user status:', statusError);
    }
  }

  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
  });
  res.json({ message: 'Logged out successfully' });
};

// Set user offline (for page unload events)
exports.setOffline = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID required' });
    }

    await db.execute(
      `UPDATE users
       SET is_online = FALSE, last_active = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [userId]
    );

    console.log(`🔴 Set user ${userId} offline (page unload)`);
    res.json({ message: 'User set offline' });
  } catch (error) {
    console.error('Error setting user offline:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Heartbeat to keep user online
exports.heartbeat = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    await db.execute(
      `UPDATE users
       SET last_active = CURRENT_TIMESTAMP, is_online = TRUE
       WHERE id = ?`,
      [req.user.id]
    );

    res.json({ message: 'Heartbeat received' });
  } catch (error) {
    console.error('Error updating heartbeat:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
