const mysql = require('mysql2/promise');

const config = {
  host: 'yamabiko.proxy.rlwy.net',
  user: 'root',
  password: 'mypassword',
  database: 'railway',
  port: 50024,
  connectTimeout: 60000,
};

console.log('🔍 Checking users table structure...');

(async () => {
  try {
    const conn = await mysql.createConnection(config);
    console.log('✅ Connected to Railway MySQL');

    // Check if users table exists
    const [tables] = await conn.execute("SHOW TABLES LIKE 'users'");

    if (tables.length === 0) {
      console.log('❌ Table "users" does not exist');
      console.log('📝 Creating users table...');

      await conn.execute(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Users table created successfully');
    } else {
      console.log('✅ Table "users" exists');

      // Show table structure
      const [structure] = await conn.execute('DESCRIBE users');
      console.log('📋 Table structure:');
      console.table(structure);

      // Count existing users
      const [count] = await conn.execute('SELECT COUNT(*) as count FROM users');
      console.log(`👥 Number of users: ${count[0].count}`);
    }

    await conn.end();
    console.log('✅ Connection closed');
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Code:', err.code);
  }
})();
