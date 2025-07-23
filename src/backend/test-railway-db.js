require('dotenv').config({ path: '.env.railway' });
const mysql = require('mysql2/promise');

console.log('🚂 Testing Railway database connection...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);

(async () => {
  try {
    console.log('🔄 Attempting to connect...');
    
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      connectTimeout: 60000,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('✅ Kết nối thành công đến Railway MySQL!');
    
    // Test query
    const [rows] = await conn.execute('SELECT 1 as test, NOW() as current_time');
    console.log('✅ Test query successful:', rows);
    
    // Check existing tables
    const [tables] = await conn.execute('SHOW TABLES');
    console.log('📋 Existing tables:', tables);
    
    await conn.end();
    console.log('✅ Connection closed successfully');
    
  } catch (err) {
    console.error('❌ Không thể kết nối:', err.message);
    console.error('Error code:', err.code);
    console.error('Error errno:', err.errno);
    
    if (err.code === 'ETIMEDOUT') {
      console.log('💡 Suggestions:');
      console.log('1. Check if Railway database is running');
      console.log('2. Verify connection string is correct');
      console.log('3. Check firewall/network settings');
    }
  }
})();
