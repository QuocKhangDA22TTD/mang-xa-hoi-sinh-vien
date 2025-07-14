const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('✅ Kết nối thành công đến MySQL!');
    await conn.end();
  } catch (err) {
    console.error('❌ Không thể kết nối:', err.message);
  }
})();
