require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const chatRoutes = require('./routes/chat.routes');
const postRoutes = require('./routes/postRoutes');
const profileRoutes = require('./routes/profileRoutes');
const friendRoutes = require('./routes/friend.routes');
const notificationRoutes = require('./routes/notificationRoutes');
const postInteractionRoutes = require('./routes/postInteractionRoutes');
const setupSocket = require('./sockets/socket');
const userStatusService = require('./services/userStatusService');

const app = express();
const server = http.createServer(app); // dùng server http để tích hợp socket.io

app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: [
    'https://mang-xa-hoi-sinh-vien-production.up.railway.app',
    'https://daring-embrace-production.up.railway.app', // thêm domain frontend Railway
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Social Network API Documentation'
}));

// Khởi chạy socket.io
const io = require('socket.io')(server, {
  cors: {
    origin: [
      'https://mang-xa-hoi-sinh-vien-production.up.railway.app',
      'https://daring-embrace-production.up.railway.app', // thêm frontend domain Railway
      'http://localhost:5173'
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io available to routes
app.set('io', io);

// Middleware to add io to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes (after io middleware)
app.use('/api/posts', postRoutes);
app.use('/api/posts', postInteractionRoutes); // Post interactions (likes, comments)
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/friend', friendRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);

setupSocket(io); // gọi file socket.js

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server + Socket.io running on port ${PORT}`)
);
