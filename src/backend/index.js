require('dotenv').config(); // Đọc biến từ .env

const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

require('dotenv').config();

app.use(express.json());

const allowedOrigins = [
  'http://localhost:5173',
  'https://mang-xa-hoi-sinh-vien-production.up.railway.app',
  `https://${process.env.FRONTEND_URL}`,
  // Thêm các URL có thể có
  'https://daring-embrace-production.up.railway.app',
].filter(Boolean);

console.log('🌐 Allowed CORS origins:', allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Cho phép requests không có origin (như Postman, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const postRoutes = require('./routes/postRoutes');

app.use('/api/posts', postRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
