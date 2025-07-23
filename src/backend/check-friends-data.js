const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'MXHSV',
});

async function checkFriendsData() {
  try {
    console.log('🔍 Checking friends data in database...');
    
    // Check users
    const [users] = await db.execute('SELECT id, email FROM users');
    console.log('👥 Users:', users);
    
    // Check friend_requests
    const [requests] = await db.execute('SELECT * FROM friend_requests');
    console.log('📝 Friend requests:', requests);
    
    // Check profiles
    const [profiles] = await db.execute('SELECT user_id, full_name, avatar_url FROM profile');
    console.log('👤 Profiles:', profiles);
    
    // Test exact query for user 6
    const user_id = 6;
    const [friends] = await db.execute(
      `SELECT DISTINCT
              CASE
                WHEN fr.sender_id = ? THEN u2.id
                ELSE u1.id
              END as friend_id,
              CASE
                WHEN fr.sender_id = ? THEN u2.email
                ELSE u1.email
              END as friend_email,
              CASE
                WHEN fr.sender_id = ? THEN p2.full_name
                ELSE p1.full_name
              END as friend_name,
              CASE
                WHEN fr.sender_id = ? THEN p2.avatar_url
                ELSE p1.avatar_url
              END as friend_avatar,
              fr.updated_at as became_friends_at
       FROM friend_requests fr
       JOIN users u1 ON fr.sender_id = u1.id
       JOIN users u2 ON fr.receiver_id = u2.id
       LEFT JOIN profile p1 ON u1.id = p1.user_id
       LEFT JOIN profile p2 ON u2.id = p2.user_id
       WHERE (fr.sender_id = ? OR fr.receiver_id = ?)
       AND fr.status = 'accepted'
       ORDER BY fr.updated_at DESC`,
      [user_id, user_id, user_id, user_id, user_id, user_id]
    );
    
    console.log('🤝 Friends for user 6:', friends);
    
    // Test for user 7
    const user_id_7 = 7;
    const [friends7] = await db.execute(
      `SELECT DISTINCT
              CASE
                WHEN fr.sender_id = ? THEN u2.id
                ELSE u1.id
              END as friend_id,
              CASE
                WHEN fr.sender_id = ? THEN u2.email
                ELSE u1.email
              END as friend_email,
              CASE
                WHEN fr.sender_id = ? THEN p2.full_name
                ELSE p1.full_name
              END as friend_name,
              CASE
                WHEN fr.sender_id = ? THEN p2.avatar_url
                ELSE p1.avatar_url
              END as friend_avatar,
              fr.updated_at as became_friends_at
       FROM friend_requests fr
       JOIN users u1 ON fr.sender_id = u1.id
       JOIN users u2 ON fr.receiver_id = u2.id
       LEFT JOIN profile p1 ON u1.id = p1.user_id
       LEFT JOIN profile p2 ON u2.id = p2.user_id
       WHERE (fr.sender_id = ? OR fr.receiver_id = ?)
       AND fr.status = 'accepted'
       ORDER BY fr.updated_at DESC`,
      [user_id_7, user_id_7, user_id_7, user_id_7, user_id_7, user_id_7]
    );
    
    console.log('🤝 Friends for user 7:', friends7);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkFriendsData();
