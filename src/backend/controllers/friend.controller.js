const db = require('../config/db');

// Lấy danh sách bạn bè
exports.getFriends = async (req, res) => {
  const user_id = req.user.id;

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

    res.json(friends);
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách bạn bè:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Gửi lời mời kết bạn
exports.sendFriendRequest = async (req, res) => {
  const { receiver_id } = req.body;
  const sender_id = req.user.id;

  try {
    // Kiểm tra receiver_id có hợp lệ không
    if (!receiver_id || isNaN(receiver_id)) {
      return res.status(400).json({ message: 'ID người nhận không hợp lệ' });
    }

    // Chuyển đổi sang số
    const receiverIdNum = parseInt(receiver_id);
    const senderIdNum = parseInt(sender_id);

    // Kiểm tra không thể gửi lời mời cho chính mình
    if (senderIdNum === receiverIdNum) {
      return res
        .status(400)
        .json({ message: 'Không thể gửi lời mời kết bạn cho chính mình' });
    }

    // Kiểm tra người nhận có tồn tại không
    const [receiverExists] = await db.execute(
      'SELECT id FROM users WHERE id = ?',
      [receiverIdNum]
    );
    if (receiverExists.length === 0) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Kiểm tra đã là bạn bè chưa
    const [existingFriendship] = await db.execute(
      `SELECT * FROM friend_requests
       WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
       AND status = 'accepted'`,
      [senderIdNum, receiverIdNum, receiverIdNum, senderIdNum]
    );
    if (existingFriendship.length > 0) {
      return res.status(400).json({ message: 'Đã là bạn bè' });
    }

    // Kiểm tra đã gửi lời mời chưa
    const [existingRequest] = await db.execute(
      'SELECT * FROM friend_requests WHERE sender_id = ? AND receiver_id = ? AND status = "pending"',
      [senderIdNum, receiverIdNum]
    );
    if (existingRequest.length > 0) {
      return res.status(400).json({ message: 'Đã gửi lời mời kết bạn' });
    }

    // Kiểm tra có lời mời ngược lại không
    const [reverseRequest] = await db.execute(
      'SELECT * FROM friend_requests WHERE sender_id = ? AND receiver_id = ? AND status = "pending"',
      [receiverIdNum, senderIdNum]
    );
    if (reverseRequest.length > 0) {
      return res
        .status(400)
        .json({ message: 'Người này đã gửi lời mời kết bạn cho bạn' });
    }

    // Tạo lời mời kết bạn mới
    const [result] = await db.execute(
      'INSERT INTO friend_requests (sender_id, receiver_id) VALUES (?, ?)',
      [senderIdNum, receiverIdNum]
    );

    res.status(201).json({
      message: 'Gửi lời mời kết bạn thành công',
      requestId: result.insertId,
    });
  } catch (error) {
    console.error('❌ Lỗi gửi lời mời kết bạn:', error);

    // Kiểm tra lỗi foreign key constraint
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        message: 'Người dùng không tồn tại trong hệ thống',
        error: 'INVALID_USER_ID',
      });
    }

    // Kiểm tra lỗi duplicate entry
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        message: 'Lời mời kết bạn đã tồn tại',
        error: 'DUPLICATE_REQUEST',
      });
    }

    res.status(500).json({
      message: 'Lỗi server',
      error: error.message,
      code: error.code,
    });
  }
};

// Lấy danh sách lời mời đã gửi
exports.getSentRequests = async (req, res) => {
  const sender_id = req.user.id;

  try {
    const [requests] = await db.execute(
      `SELECT fr.id, fr.status, fr.created_at,
              u.id as receiver_id, u.email as receiver_email,
              p.full_name as receiver_name, p.avatar_url as receiver_avatar
       FROM friend_requests fr
       JOIN users u ON fr.receiver_id = u.id
       LEFT JOIN profile p ON u.id = p.user_id
       WHERE fr.sender_id = ?
       ORDER BY fr.created_at DESC`,
      [sender_id]
    );

    res.json(requests);
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách lời mời đã gửi:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy danh sách lời mời đã nhận
exports.getReceivedRequests = async (req, res) => {
  const receiver_id = req.user.id;

  try {
    const [requests] = await db.execute(
      `SELECT fr.id, fr.status, fr.created_at,
              u.id as sender_id, u.email as sender_email,
              p.full_name as sender_name, p.avatar_url as sender_avatar
       FROM friend_requests fr
       JOIN users u ON fr.sender_id = u.id
       LEFT JOIN profile p ON u.id = p.user_id
       WHERE fr.receiver_id = ? AND fr.status = 'pending'
       ORDER BY fr.created_at DESC`,
      [receiver_id]
    );

    res.json(requests);
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách lời mời đã nhận:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Chấp nhận lời mời kết bạn
exports.acceptFriendRequest = async (req, res) => {
  const { request_id } = req.params;
  const receiver_id = req.user.id;

  console.log('🔍 Accept friend request:', { request_id, receiver_id });

  try {
    // Kiểm tra lời mời có tồn tại và thuộc về user hiện tại không
    const [request] = await db.execute(
      'SELECT * FROM friend_requests WHERE id = ? AND receiver_id = ? AND status = "pending"',
      [request_id, receiver_id]
    );

    if (request.length === 0) {
      return res
        .status(404)
        .json({ message: 'Lời mời kết bạn không tồn tại hoặc đã được xử lý' });
    }

    // Cập nhật trạng thái thành accepted
    await db.execute(
      'UPDATE friend_requests SET status = "accepted", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [request_id]
    );

    res.json({ message: 'Chấp nhận lời mời kết bạn thành công' });
  } catch (error) {
    console.error('❌ Lỗi chấp nhận lời mời kết bạn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Từ chối lời mời kết bạn
exports.declineFriendRequest = async (req, res) => {
  const { request_id } = req.params;
  const receiver_id = req.user.id;

  try {
    // Kiểm tra lời mời có tồn tại và thuộc về user hiện tại không
    const [request] = await db.execute(
      'SELECT * FROM friend_requests WHERE id = ? AND receiver_id = ? AND status = "pending"',
      [request_id, receiver_id]
    );

    if (request.length === 0) {
      return res
        .status(404)
        .json({ message: 'Lời mời kết bạn không tồn tại hoặc đã được xử lý' });
    }

    // Cập nhật trạng thái thành declined
    await db.execute(
      'UPDATE friend_requests SET status = "declined", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [request_id]
    );

    res.json({ message: 'Từ chối lời mời kết bạn thành công' });
  } catch (error) {
    console.error('❌ Lỗi từ chối lời mời kết bạn:', error);
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
