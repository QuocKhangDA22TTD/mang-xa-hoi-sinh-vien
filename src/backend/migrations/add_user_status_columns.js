// Use local database connection for migration
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Adjust if you have a password
  database: 'MXHSV',
});

async function addUserStatusColumns() {
  try {
    console.log('🔍 Adding is_online and last_active columns to users table...');
    
    // Check if columns already exist
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'MXHSV' 
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME IN ('is_online', 'last_active')
    `);
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    console.log('🔍 Existing columns:', existingColumns);
    
    // Add is_online column if it doesn't exist
    if (!existingColumns.includes('is_online')) {
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN is_online BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ Added is_online column');
    } else {
      console.log('ℹ️ is_online column already exists');
    }
    
    // Add last_active column if it doesn't exist
    if (!existingColumns.includes('last_active')) {
      await db.execute(`
        ALTER TABLE users 
        ADD COLUMN last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
      console.log('✅ Added last_active column');
    } else {
      console.log('ℹ️ last_active column already exists');
    }
    
    // Verify the changes
    const [newColumns] = await db.execute(`
      SHOW COLUMNS FROM users
    `);
    console.log('🔍 Users table structure:');
    newColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null} ${col.Default || ''}`);
    });
    
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run migration
addUserStatusColumns();
