function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    // Khi client join phòng (ví dụ: theo userId hoặc conversationId)
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`👤 User ${userId} joined room`);
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

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });
}

module.exports = socketHandler;
