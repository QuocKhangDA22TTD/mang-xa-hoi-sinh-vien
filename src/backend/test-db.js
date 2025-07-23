require('dotenv').config();
const mysql = require('mysql2/promise');

console.log('🔍 Testing database connection...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      connectTimeout: 60000,
    });

    console.log('✅ Kết nối thành công đến MySQL!');

    // Test query
    const [rows] = await conn.execute('SELECT 1 as test');
    console.log('✅ Test query successful:', rows);

    await conn.end();
  } catch (err) {
    console.error('❌ Không thể kết nối:', err.message);
    console.error('Full error:', err);
  }
})();
