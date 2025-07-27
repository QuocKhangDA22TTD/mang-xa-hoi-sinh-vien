const db = require('../config/db');
const SocketNotificationService = require('../services/SocketNotificationService');

// Gửi lời mời kết bạn
exports.sendFriendRequest = async (req, res) => {
  const { receiver_id } = req.body;
  const sender_id = req.user.id;

  console.log('🔍 sendFriendRequest - req.io exists:', !!req.io);
  console.log('🔍 sendFriendRequest - io type:', typeof req.io);

  if (sender_id === receiver_id) {
    return res
      .status(400)
      .json({ message: 'Không thể gửi lời mời kết bạn cho chính mình' });
  }

  try {
    // Kiểm tra xem đã có lời mời nào chưa
    const [existing] = await db.execute(
      `SELECT * FROM friend_requests 
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`,
      [sender_id, receiver_id, receiver_id, sender_id]
    );

    if (existing.length > 0) {
      const request = existing[0];
      if (request.status === 'accepted') {
        return res.status(400).json({ message: 'Đã là bạn bè' });
      } else if (request.status === 'pending') {
        return res.status(400).json({ message: 'Lời mời kết bạn đã được gửi' });
      }
    }

    // Tạo lời mời kết bạn mới
    await db.execute(
      `INSERT INTO friend_requests (sender_id, receiver_id, status, created_at, updated_at)
       VALUES (?, ?, 'pending', NOW(), NOW())`,
      [sender_id, receiver_id]
    );

    // Get sender info for notification
    const [senderInfo] = await db.execute(
      `SELECT u.email, p.full_name FROM users u
       LEFT JOIN profile p ON u.id = p.user_id
       WHERE u.id = ?`,
      [sender_id]
    );

    // Send real-time notification to receiver
    if (req.io && senderInfo.length > 0) {
      const senderData = {
        id: sender_id,
        name: senderInfo[0].full_name || senderInfo[0].email,
        email: senderInfo[0].email,
        avatar: senderInfo[0].avatar_url || null,
      };

      console.log(
        `📨 Sending friend request notification to user ${receiver_id}:`,
        senderData
      );

      // Use SocketNotificationService
      const socketNotificationService = new SocketNotificationService(req.io);
      await socketNotificationService.sendFriendRequestNotification(
        receiver_id,
        senderData
      );

      console.log(`📨 Friend request notification sent to user ${receiver_id}`);
    } else {
      console.log('❌ Cannot send notification - missing io or sender info');
      console.log('🔍 req.io exists:', !!req.io);
      console.log('🔍 senderInfo length:', senderInfo.length);
    }

    res.status(201).json({ message: 'Gửi lời mời kết bạn thành công' });
  } catch (error) {
    console.error('❌ Lỗi gửi lời mời kết bạn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy danh sách lời mời đã gửi
exports.getSentRequests = async (req, res) => {
  const user_id = req.user.id;

  try {
    const [requests] = await db.execute(
      `SELECT fr.id, fr.receiver_id, fr.status, fr.created_at, fr.updated_at,
              u.email, p.full_name, p.avatar_url
       FROM friend_requests fr
       JOIN users u ON fr.receiver_id = u.id
       LEFT JOIN profile p ON u.id = p.user_id
       WHERE fr.sender_id = ? AND fr.status = 'pending'
       ORDER BY fr.created_at DESC`,
      [user_id]
    );

    res.json(requests);
  } catch (error) {
    console.error('❌ Lỗi lấy danh sách lời mời đã gửi:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy danh sách lời mời đã nhận
exports.getReceivedRequests = async (req, res) => {
  const user_id = req.user.id;

  try {
    const [requests] = await db.execute(
      `SELECT fr.id, fr.sender_id, fr.status, fr.created_at, fr.updated_at,
              u.email, p.full_name, p.avatar_url
       FROM friend_requests fr
       JOIN users u ON fr.sender_id = u.id
       LEFT JOIN profile p ON u.id = p.user_id
       WHERE fr.receiver_id = ? AND fr.status = 'pending'
       ORDER BY fr.created_at DESC`,
      [user_id]
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
  const user_id = req.user.id;

  try {
    // Kiểm tra lời mời có tồn tại và thuộc về user hiện tại không
    const [request] = await db.execute(
      `SELECT * FROM friend_requests 
       WHERE id = ? AND receiver_id = ? AND status = 'pending'`,
      [request_id, user_id]
    );

    if (request.length === 0) {
      return res
        .status(404)
        .json({ message: 'Không tìm thấy lời mời kết bạn' });
    }

    // Cập nhật trạng thái thành accepted
    await db.execute(
      `UPDATE friend_requests
       SET status = 'accepted', updated_at = NOW()
       WHERE id = ?`,
      [request_id]
    );

    // Get accepter info for notification
    const [accepterInfo] = await db.execute(
      `SELECT u.email, p.full_name, p.avatar_url FROM users u
       LEFT JOIN profile p ON u.id = p.user_id
       WHERE u.id = ?`,
      [user_id]
    );

    // Send real-time notification to sender
    if (req.io && accepterInfo.length > 0) {
      const accepterData = {
        id: user_id,
        name: accepterInfo[0].full_name || accepterInfo[0].email,
        email: accepterInfo[0].email,
        avatar: accepterInfo[0].avatar_url || null,
      };

      const senderId = request[0].sender_id;
      const socketNotificationService = new SocketNotificationService(req.io);
      await socketNotificationService.sendFriendAcceptedNotification(
        senderId,
        accepterData
      );

      console.log(
        `✅ Friend request accepted notification sent to user ${senderId}`
      );
    }

    res.json({ message: 'Chấp nhận lời mời kết bạn thành công' });
  } catch (error) {
    console.error('❌ Lỗi chấp nhận lời mời kết bạn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Từ chối lời mời kết bạn
exports.declineFriendRequest = async (req, res) => {
  const { request_id } = req.params;
  const user_id = req.user.id;

  try {
    // Kiểm tra lời mời có tồn tại và thuộc về user hiện tại không
    const [request] = await db.execute(
      `SELECT * FROM friend_requests 
       WHERE id = ? AND receiver_id = ? AND status = 'pending'`,
      [request_id, user_id]
    );

    if (request.length === 0) {
      return res
        .status(404)
        .json({ message: 'Không tìm thấy lời mời kết bạn' });
    }

    // Get decliner info for notification
    const [declinerInfo] = await db.execute(
      `SELECT u.email, p.full_name, p.avatar_url FROM users u
       LEFT JOIN profile p ON u.id = p.user_id
       WHERE u.id = ?`,
      [user_id]
    );

    // Send real-time notification to sender
    if (req.io && declinerInfo.length > 0) {
      const declinerData = {
        id: user_id,
        name: declinerInfo[0].full_name || declinerInfo[0].email,
        email: declinerInfo[0].email,
        avatar: declinerInfo[0].avatar_url || null,
      };

      const senderId = request[0].sender_id;
      const socketNotificationService = new SocketNotificationService(req.io);
      await socketNotificationService.sendFriendDeclinedNotification(
        senderId,
        declinerData
      );

      console.log(
        `❌ Friend request declined notification sent to user ${senderId}`
      );
    }

    // Xóa lời mời kết bạn
    await db.execute(`DELETE FROM friend_requests WHERE id = ?`, [request_id]);

    res.json({ message: 'Từ chối lời mời kết bạn thành công' });
  } catch (error) {
    console.error('❌ Lỗi từ chối lời mời kết bạn:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
