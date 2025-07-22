const db = require('./config/db');

async function addSampleFriends() {
  try {
    console.log('🔍 Thêm dữ liệu mẫu cho friends...');
    
    // Thêm friend requests đã accepted
    await db.execute(`
      INSERT IGNORE INTO friend_requests (sender_id, receiver_id, status) VALUES
      (1, 2, 'accepted'),
      (1, 3, 'accepted'),
      (2, 4, 'accepted')
    `);
    
    console.log('✅ Đã thêm dữ liệu mẫu friends');
    
    // Kiểm tra kết quả
    const [friends] = await db.execute(`
      SELECT fr.*, 
             u1.email as sender_email, 
             u2.email as receiver_email
      FROM friend_requests fr
      JOIN users u1 ON fr.sender_id = u1.id
      JOIN users u2 ON fr.receiver_id = u2.id
      WHERE fr.status = 'accepted'
    `);
    
    console.log('👥 Friend relationships:', friends);
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    process.exit(0);
  }
}

addSampleFriends();
