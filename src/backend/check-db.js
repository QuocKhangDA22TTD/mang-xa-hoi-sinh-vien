const db = require('./config/db');

async function checkDatabase() {
  try {
    console.log('🔍 Kiểm tra database...');
    
    // Kiểm tra bảng users
    const [users] = await db.execute('SELECT * FROM users LIMIT 5');
    console.log('👥 Users trong database:', users);
    
    // Kiểm tra bảng friend_requests
    const [friendRequests] = await db.execute('SELECT * FROM friend_requests LIMIT 5');
    console.log('🤝 Friend requests:', friendRequests);
    
    // Kiểm tra foreign key constraints
    const [constraints] = await db.execute(`
      SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = 'MXHSV' 
      AND REFERENCED_TABLE_NAME IS NOT NULL
      AND TABLE_NAME = 'friend_requests'
    `);
    console.log('🔗 Foreign key constraints:', constraints);
    
    console.log('✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    process.exit(0);
  }
}

checkDatabase();
