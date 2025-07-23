// Simple server for testing CORS without complex routes
require('dotenv').config();
const express = require('express');

const app = express();

// CORS headers on ALL responses
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} from origin: ${req.headers.origin}`);
  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'false');
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight');
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

// Simple endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/simple', (req, res) => {
  res.json({ message: 'Simple endpoint works!', origin: req.headers.origin });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'CORS test successful!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
  });
});

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  console.log('📝 Register request:', req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }
  
  // Simple success response for testing
  res.status(201).json({ 
    message: 'Registration successful (test mode)',
    email: email 
  });
});

app.post('/api/auth/login', async (req, res) => {
  console.log('📝 Login request:', req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }
  
  // Simple success response for testing
  res.status(200).json({ 
    message: 'Login successful (test mode)',
    email: email,
    token: 'test-token-123'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log('🌐 CORS enabled for all origins');
});

module.exports = app;
