const db = require('../config/db');

// Lấy danh sách bạn bè
exports.getFriends = async (req, res) => {
  const user_id = req.user.id;
  console.log('🔍 getFriends called for user:', user_id);

  try {
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
              CASE
                WHEN fr.sender_id = ? THEN u2.last_active
                ELSE u1.last_active
              END as last_active,
              CASE
                WHEN fr.sender_id = ? THEN u2.is_online
                ELSE u1.is_online
              END as is_online,
              fr.updated_at as became_friends_at
       FROM friend_requests fr
       JOIN users u1 ON fr.sender_id = u1.id
       JOIN users u2 ON fr.receiver_id = u2.id
       LEFT JOIN profile p1 ON u1.id = p1.user_id
       LEFT JOIN profile p2 ON u2.id = p2.user_id
       WHERE (fr.sender_id = ? OR fr.receiver_id = ?)
       AND fr.status = 'accepted'
       ORDER BY fr.updated_at DESC`,
      [user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id]
    );

    console.log('🔍 Found friends:', friends.length);
    console.log('🔍 Friends data:', friends);
    res.json(friends);
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách bạn bè:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Hủy kết bạn
exports.unfriend = async (req, res) => {
  const { friend_id } = req.params;
  const user_id = req.user.id;

  try {
    // Tìm mối quan hệ bạn bè
    const [friendship] = await db.execute(
      `SELECT * FROM friend_requests 
       WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)) 
       AND status = 'accepted'`,
      [user_id, friend_id, friend_id, user_id]
    );

    if (friendship.length === 0) {
      return res
        .status(404)
        .json({ message: 'Không tìm thấy mối quan hệ bạn bè' });
    }

    // Xóa mối quan hệ bạn bè
    await db.execute(
      `DELETE FROM friend_requests 
       WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)) 
       AND status = 'accepted'`,
      [user_id, friend_id, friend_id, user_id]
    );

    res.json({ message: 'Hủy kết bạn thành công' });
  } catch (error) {
    console.error('❌ Lỗi hủy kết bạn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy danh sách tất cả users (để tìm kiếm và gửi lời mời)
exports.getAllUsers = async (req, res) => {
  const current_user_id = req.user.id;
  const { search } = req.query;

  try {
    let query = `
      SELECT u.id, u.email, p.full_name, p.avatar_url,
             CASE 
               WHEN fr1.status = 'accepted' THEN 'friend'
               WHEN fr1.status = 'pending' AND fr1.sender_id = ? THEN 'sent'
               WHEN fr1.status = 'pending' AND fr1.receiver_id = ? THEN 'received'
               ELSE 'none'
             END as friendship_status
      FROM users u
      LEFT JOIN profile p ON u.id = p.user_id
      LEFT JOIN friend_requests fr1 ON 
        ((fr1.sender_id = u.id AND fr1.receiver_id = ?) OR 
         (fr1.sender_id = ? AND fr1.receiver_id = u.id))
      WHERE u.id != ?
    `;

    let params = [
      current_user_id,
      current_user_id,
      current_user_id,
      current_user_id,
      current_user_id,
    ];

    if (search) {
      query += ` AND (u.email LIKE ? OR p.full_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY p.full_name ASC`;

    const [users] = await db.execute(query, params);
    res.json(users);
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách users:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
