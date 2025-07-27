const db = require('../config/db');

// Function to broadcast user status to friends
async function broadcastUserStatusToFriends(userId, isOnline, io) {
  try {
    // Get user's friends
    const [friends] = await db.execute(
      `SELECT DISTINCT
        CASE
          WHEN fr.sender_id = ? THEN fr.receiver_id
          ELSE fr.sender_id
        END as friend_id
       FROM friend_requests fr
       WHERE (fr.sender_id = ? OR fr.receiver_id = ?)
       AND fr.status = 'accepted'`,
      [userId, userId, userId]
    );

    console.log(
      `📡 Broadcasting status change for user ${userId} to ${friends.length} friends`
    );

    // Broadcast to each friend
    friends.forEach((friend) => {
      io.to(`user_${friend.friend_id}`).emit('friend_status_change', {
        userId: parseInt(userId),
        isOnline,
        lastActive: new Date().toISOString(),
      });
    });

    console.log(`✅ Status broadcast complete for user ${userId}`);
  } catch (error) {
    console.error('❌ Error broadcasting user status:', error);
  }
}

function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    // Khi client join phòng (ví dụ: theo userId hoặc conversationId)
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`👤 User ${userId} joined room`);
    });

    // Join user room for personal notifications and set online status
    socket.on('join_user_room', async (userId) => {
      socket.userId = userId; // Store userId on socket for disconnect handling
      socket.join(`user_${userId}`);
      console.log(`👤 User ${userId} joined personal room: user_${userId}`);
      console.log(`🔍 Socket ${socket.id} joined room user_${userId}`);

      try {
        // Update user status to online
        await db.execute(
          'UPDATE users SET is_online = TRUE, last_active = NOW() WHERE id = ?',
          [userId]
        );
        console.log(`🟢 User ${userId} marked as online`);

        // Broadcast user online status to friends
        await broadcastUserStatusToFriends(userId, true, io);
      } catch (error) {
        console.error('❌ Error updating user online status:', error);
      }

      // Confirm to client that they joined
      socket.emit('joined_user_room', { userId, room: `user_${userId}` });

      // Test emit to verify socket is working
      setTimeout(() => {
        socket.emit('test_notification', {
          message: 'Test notification for debugging',
          userId: userId,
        });
        console.log(`🧪 Test notification sent to user ${userId}`);
      }, 2000);
    });

    // Khi client gửi tin nhắn (chỉ để broadcast, không lưu DB)
    socket.on('broadcast_message', (messageData) => {
      console.log('🔍 Socket broadcasting message:', messageData);

      // Gửi tin nhắn đến người nhận (nếu có receiver_id)
      if (messageData.receiver_id) {
        io.to(messageData.receiver_id.toString()).emit(
          'receive_message',
          messageData
        );
        console.log(
          '🔍 Message sent to receiver room:',
          messageData.receiver_id
        );
      }

      // Gửi đến tất cả members trong conversation (backup)
      io.to(`conversation_${messageData.conversation_id}`).emit(
        'receive_message',
        messageData
      );

      console.log(
        '🔍 Message broadcasted to conversation:',
        messageData.conversation_id
      );
    });

    socket.on('disconnect', async () => {
      console.log('❌ Client disconnected:', socket.id);

      if (socket.userId) {
        try {
          // Update user status to offline
          await db.execute(
            'UPDATE users SET is_online = FALSE, last_active = NOW() WHERE id = ?',
            [socket.userId]
          );
          console.log(`🔴 User ${socket.userId} marked as offline`);

          // Broadcast user offline status to friends
          await broadcastUserStatusToFriends(socket.userId, false, io);
        } catch (error) {
          console.error('❌ Error updating user offline status:', error);
        }
      }
    });
  });
}

module.exports = socketHandler;
