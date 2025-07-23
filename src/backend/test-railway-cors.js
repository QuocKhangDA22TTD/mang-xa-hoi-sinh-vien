// Test CORS directly from Node.js
const https = require('https');

const testEndpoint = (url, method = 'GET', headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Origin': 'https://mang-xa-hoi-sinh-vien-production.up.railway.app',
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`\n🧪 Testing ${method} ${url}`);
        console.log(`Status: ${res.statusCode}`);
        console.log('Headers:', res.headers);
        console.log('Body:', data);
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Error testing ${url}:`, error.message);
      reject(error);
    });

    req.end();
  });
};

(async () => {
  const baseUrl = 'https://daring-embrace-production.up.railway.app';
  
  console.log('🚀 Testing Railway backend CORS...');
  
  try {
    // Test health endpoint
    await testEndpoint(`${baseUrl}/health`);
    
    // Test OPTIONS preflight
    await testEndpoint(`${baseUrl}/api/test`, 'OPTIONS');
    
    // Test actual endpoint
    await testEndpoint(`${baseUrl}/api/test`);
    
    console.log('\n✅ All tests completed');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
})();
