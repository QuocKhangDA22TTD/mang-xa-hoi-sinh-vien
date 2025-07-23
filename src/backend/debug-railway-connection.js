require('dotenv').config({ path: '.env.railway' });

console.log('🔍 DEBUG: Railway Database Connection Info');
console.log('==========================================');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 'undefined');
console.log('DB_PASSWORD first 3 chars:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.substring(0, 3) + '...' : 'undefined');
console.log('==========================================');

// Kiểm tra connection string format
const connectionString = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
console.log('Connection string format:');
console.log(`mysql://${process.env.DB_USER}:***@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

// Test với các cấu hình khác nhau
const mysql = require('mysql2/promise');

async function testConnection(config, description) {
  console.log(`\n🧪 Testing: ${description}`);
  try {
    const conn = await mysql.createConnection(config);
    console.log('✅ Success!');
    await conn.end();
    return true;
  } catch (err) {
    console.log('❌ Failed:', err.message);
    console.log('Error code:', err.code);
    return false;
  }
}

(async () => {
  // Test 1: Cấu hình hiện tại
  await testConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectTimeout: 60000,
  }, 'Current config');

  // Test 2: Với SSL
  await testConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectTimeout: 60000,
    ssl: { rejectUnauthorized: false }
  }, 'With SSL disabled');

  // Test 3: Không chỉ định database
  await testConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    connectTimeout: 60000,
  }, 'Without database specified');

  console.log('\n💡 Nếu tất cả đều fail, hãy:');
  console.log('1. Kiểm tra lại password trong Railway dashboard');
  console.log('2. Đảm bảo MySQL service đang chạy');
  console.log('3. Thử tạo user mới trong Railway MySQL console');
})();
