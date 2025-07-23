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

// Manual CORS headers middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`📝 ${req.method} ${req.path} from origin: ${origin}`);

  // Set CORS headers manually
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request');
    return res.sendStatus(200);
  }

  next();
});

// Temporary: Allow all origins for debugging
app.use(
  cors({
    origin: true, // Allow all origins temporarily
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Original CORS config (commented out for debugging)
/*
app.use(
  cors({
    origin: function (origin, callback) {
      console.log('🔍 CORS check for origin:', origin);
      // Cho phép requests không có origin (như Postman, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        console.log('✅ CORS allowed for origin:', origin);
        callback(null, true);
      } else {
        console.log('❌ CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
*/

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const postRoutes = require('./routes/postRoutes');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint called from:', req.headers.origin);
  res.json({
    message: 'CORS test successful!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins,
  });
});

app.use('/api/posts', postRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🌐 Allowed origins:', allowedOrigins);
});
