// Use local database connection for migration
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Adjust if you have a password
  database: 'MXHSV',
});

async function addMessageColumns() {
  try {
    console.log(
      '🔍 Adding message_type and attachment_url columns to messages table...'
    );

    // Check if columns already exist
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'MXHSV' 
      AND TABLE_NAME = 'messages'
      AND COLUMN_NAME IN ('message_type', 'attachment_url')
    `);

    const existingColumns = columns.map((col) => col.COLUMN_NAME);
    console.log('🔍 Existing columns:', existingColumns);

    // Add message_type column if it doesn't exist
    if (!existingColumns.includes('message_type')) {
      await db.execute(`
        ALTER TABLE messages 
        ADD COLUMN message_type ENUM('text', 'image', 'file') DEFAULT 'text'
      `);
      console.log('✅ Added message_type column');
    } else {
      console.log('ℹ️ message_type column already exists');
    }

    // Add attachment_url column if it doesn't exist
    if (!existingColumns.includes('attachment_url')) {
      await db.execute(`
        ALTER TABLE messages 
        ADD COLUMN attachment_url TEXT
      `);
      console.log('✅ Added attachment_url column');
    } else {
      console.log('ℹ️ attachment_url column already exists');
    }

    // Verify the changes
    const [newColumns] = await db.execute(`
      SHOW COLUMNS FROM messages
    `);
    console.log('🔍 Messages table structure:');
    newColumns.forEach((col) => {
      console.log(
        `  - ${col.Field}: ${col.Type} ${col.Null} ${col.Default || ''}`
      );
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
addMessageColumns();
