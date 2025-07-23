// Minimal server - no dependencies except express
const express = require('express');
const app = express();

console.log('🚀 Starting minimal server...');

// Basic middleware
app.use(express.json());

// CORS for ALL requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Basic endpoints
app.get('/', (req, res) => {
  res.json({ message: 'Minimal server is running!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/simple', (req, res) => {
  res.json({ message: 'Simple endpoint works!' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API test successful!' });
});

// Auth endpoints - basic implementation
app.post('/api/auth/register', (req, res) => {
  console.log('Register request:', req.body);
  res.json({ message: 'Registration successful (minimal mode)' });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login request:', req.body);
  res.json({ message: 'Login successful (minimal mode)', token: 'test-token' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('❌ Server error:', err);
});
