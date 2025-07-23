const mysql = require('mysql2/promise');

const config = {
  host: 'yamabiko.proxy.rlwy.net',
  user: 'root',
  password: 'mypassword',
  database: 'railway',
  port: 50024,
  connectTimeout: 60000,
};

console.log('Testing Railway connection...');

(async () => {
  try {
    const conn = await mysql.createConnection(config);
    console.log('✅ Connected successfully!');

    // Test query
    const [rows] = await conn.execute('SELECT 1 as test');
    console.log('✅ Query successful:', rows);

    // Check tables
    const [tables] = await conn.execute('SHOW TABLES');
    console.log('📋 Tables:', tables);

    await conn.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Code:', err.code);
  }
})();
