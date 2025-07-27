const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  console.log('🔍 verifyToken - token:', token ? 'exists' : 'missing');
  console.log(
    '🔍 verifyToken - JWT_SECRET:',
    JWT_SECRET ? 'exists' : 'missing'
  );

  if (!token) {
    console.log('❌ verifyToken - No token provided');
    return res
      .status(401)
      .json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ verifyToken - decoded user:', decoded);
    req.user = decoded; // gán user info vào req để các middleware hoặc route khác dùng
    next(); // tiếp tục middleware hoặc route handler tiếp theo
  } catch (err) {
    console.log('❌ verifyToken - JWT verify error:', err.message);
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = verifyToken;
