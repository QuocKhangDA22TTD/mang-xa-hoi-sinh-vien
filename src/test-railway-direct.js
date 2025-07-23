// Direct test of Railway backend without CORS
const https = require('https');

const testUrl = (url) => {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Testing: ${url}`);
    
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log('Headers:', JSON.stringify(res.headers, null, 2));
        console.log('Body:', data);
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Error: ${error.message}`);
      reject(error);
    });
  });
};

(async () => {
  const baseUrl = 'https://daring-embrace-production.up.railway.app';
  
  console.log('🚀 Testing Railway backend directly (no CORS)...');
  
  try {
    await testUrl(`${baseUrl}/health`);
    await testUrl(`${baseUrl}/simple`);
    await testUrl(`${baseUrl}/api/test`);
    
    console.log('\n✅ Direct tests completed');
    console.log('\n💡 If these work but browser fails, it\'s definitely a CORS issue');
    console.log('💡 Check if Railway deployed the latest code with CORS fixes');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
})();
