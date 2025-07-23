require('dotenv').config(); // Đọc biến từ .env

const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

require('dotenv').config();

const allowedOrigins = [
  'http://localhost:5173',
  'https://mang-xa-hoi-sinh-vien-production.up.railway.app',
  `https://${process.env.FRONTEND_URL}`,
  // Thêm các URL có thể có
  'https://daring-embrace-production.up.railway.app',
].filter(Boolean);

console.log('🌐 Allowed CORS origins:', allowedOrigins);

// Handle preflight requests first
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  console.log('🔍 OPTIONS request from origin:', origin);

  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
  } else {
    console.log('❌ OPTIONS blocked for origin:', origin);
    res.sendStatus(403);
  }
});

app.use(express.json());

// AGGRESSIVE CORS FIX - Set headers on ALL responses
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`📝 ${req.method} ${req.path} from origin: ${origin}`);

  // ALWAYS set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
  res.header('Access-Control-Allow-Credentials', 'false'); // Changed to false for wildcard origin

  // Handle ALL OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request - sending 200');
    return res.status(200).end();
  }

  next();
});

// CORS middleware removed - using manual headers only
console.log('� CORS middleware disabled - using manual headers');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const postRoutes = require('./routes/postRoutes');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// CORS test endpoint with explicit headers
app.all('/api/test', (req, res) => {
  console.log('🧪 Test endpoint called from:', req.headers.origin);

  // Set CORS headers explicitly again
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.json({
    message: 'CORS test successful!',
    method: req.method,
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins,
    headers: req.headers,
  });
});

// Simple endpoint without any middleware
app.get('/simple', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ message: 'Simple endpoint works!' });
});

app.use('/api/posts', postRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🌐 Allowed origins:', allowedOrigins);
});
