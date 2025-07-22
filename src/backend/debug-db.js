const db = require('./config/db');

async function debugDatabase() {
  try {
    console.log('🔍 Checking database tables...');
    
    // Kiểm tra bảng conversations
    const [conversationsTable] = await db.execute('SHOW TABLES LIKE "conversations"');
    console.log('📋 Conversations table exists:', conversationsTable.length > 0);
    
    // Kiểm tra bảng conversation_members
    const [membersTable] = await db.execute('SHOW TABLES LIKE "conversation_members"');
    console.log('📋 Conversation_members table exists:', membersTable.length > 0);
    
    // Kiểm tra users
    const [users] = await db.execute('SELECT id, email FROM users');
    console.log('👥 Users in database:', users);
    
    // Kiểm tra conversations hiện có
    const [conversations] = await db.execute('SELECT * FROM conversations');
    console.log('💬 Existing conversations:', conversations);
    
    // Kiểm tra conversation_members hiện có
    const [members] = await db.execute('SELECT * FROM conversation_members');
    console.log('👥 Existing conversation members:', members);
    
    // Test tạo conversation
    console.log('\n🧪 Testing conversation creation...');
    try {
      const [result] = await db.execute(
        'INSERT INTO conversations (is_group, name, admin_id) VALUES (?, ?, ?)',
        [false, null, 6]
      );
      console.log('✅ Test conversation created with ID:', result.insertId);
      
      // Test thêm member
      await db.execute(
        'INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)',
        [result.insertId, 6]
      );
      console.log('✅ Test member added');
      
      // Cleanup test data
      await db.execute('DELETE FROM conversations WHERE id = ?', [result.insertId]);
      console.log('🧹 Test data cleaned up');
      
    } catch (testError) {
      console.error('❌ Test creation failed:', testError);
    }
    
  } catch (error) {
    console.error('❌ Database debug error:', error);
  } finally {
    process.exit(0);
  }
}

debugDatabase();
