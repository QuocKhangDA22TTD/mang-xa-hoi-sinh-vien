const messageService = require('../services/message.service');

function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    // Khi client join phòng (ví dụ: theo userId hoặc conversationId)
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`👤 User ${userId} joined room`);
    });

    // Khi client gửi tin nhắn
    socket.on('send_message', async (data) => {
      const { conversation_id, sender_id, text, receiver_id } = data;

      try {
        // 1. Lưu tin nhắn vào DB qua service
        const savedMessage = await messageService.saveMessage({
          conversation_id,
          sender_id,
          text,
        });

        // 2. Gửi tin nhắn đến người nhận
        io.to(receiver_id).emit('receive_message', savedMessage);

        // 3. Gửi lại chính sender để cập nhật giao diện
        socket.emit('receive_message', savedMessage);
      } catch (err) {
        console.error('❌ Lỗi khi lưu tin nhắn:', err);
        socket.emit('error_message', 'Không gửi được tin nhắn');
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });
}

module.exports = socketHandler;
