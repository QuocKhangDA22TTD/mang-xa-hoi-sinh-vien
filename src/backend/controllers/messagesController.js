const db = require('../config/db');

exports.sendMessage = async (req, res) => {
  const { conversation_id, text, message_type = 'text' } = req.body;
  const sender_id = req.user.id;
  let attachment_url = null;

  console.log('🔍 Backend sendMessage called with:', {
    conversation_id,
    sender_id,
    text,
    message_type,
    file: req.file ? req.file.filename : 'no file',
    body: req.body,
  });

  // Validate required fields
  if (!conversation_id) {
    return res.status(400).json({ message: 'conversation_id is required' });
  }

  if (!text && !req.file) {
    return res.status(400).json({ message: 'Either text or file is required' });
  }

  // Handle file upload if present
  if (req.file) {
    attachment_url = `https://daring-embrace-production.up.railway.app/uploads/${req.file.filename}`;
    console.log('🔍 File uploaded:', attachment_url);
  }

  try {
    // First, check if the new columns exist
    const [columns] = await db.execute(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'MXHSV'
      AND TABLE_NAME = 'messages'
      AND COLUMN_NAME IN ('message_type', 'attachment_url')
    `);

    const hasNewColumns = columns.length === 2;
    console.log('🔍 Database has new columns:', hasNewColumns);

    let result;
    if (hasNewColumns) {
      // Use new schema with message_type and attachment_url
      [result] = await db.execute(
        'INSERT INTO messages (conversation_id, sender_id, text, message_type, attachment_url) VALUES (?, ?, ?, ?, ?)',
        [conversation_id, sender_id, text || '', message_type, attachment_url]
      );
    } else {
      // Use old schema with just text
      [result] = await db.execute(
        'INSERT INTO messages (conversation_id, sender_id, text) VALUES (?, ?, ?)',
        [conversation_id, sender_id, text || '']
      );
    }

    const messageId = result.insertId;
    console.log('🔍 Message inserted with ID:', messageId);

    // Get the created message with sender info
    const [messages] = await db.execute(
      `SELECT m.*, u.email as sender_email, p.full_name as sender_name, p.avatar_url as sender_avatar
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       LEFT JOIN profile p ON u.id = p.user_id
       WHERE m.id = ?`,
      [messageId]
    );

    const message = messages[0];
    console.log('🔍 Created message:', message);

    // Get conversation members for real-time notifications
    const [members] = await db.execute(
      'SELECT user_id FROM conversation_members WHERE conversation_id = ?',
      [conversation_id]
    );

    const messageData = {
      id: message.id,
      conversation_id: message.conversation_id,
      sender_id: message.sender_id,
      sender_email: message.sender_email,
      sender_name: message.sender_name,
      sender_avatar: message.sender_avatar,
      text: message.text,
      message_type: message.message_type || 'text',
      attachment_url: message.attachment_url,
      sent_at: message.sent_at,
      members: members.map((m) => m.user_id),
    };

    // Emit real-time message to all conversation members
    const io = req.app.get('io');
    console.log('🔍 IO instance available:', !!io);
    console.log('🔍 Members to notify:', members);

    if (io) {
      members.forEach((member) => {
        if (member.user_id !== sender_id) {
          // Don't send to sender
          const room = `user_${member.user_id}`;
          console.log('🔍 Emitting to room:', room);
          io.to(room).emit('new_message', messageData);
          console.log('🔍 Sent real-time message to user:', member.user_id);
        }
      });
    } else {
      console.error('❌ IO instance not available!');
    }

    // Note: Skip updating conversation updated_at since column doesn't exist

    res.status(201).json({
      message: 'Tin nhắn đã được gửi',
      data: messageData,
    });
  } catch (err) {
    console.error('❌ Error sending message:', err);
    console.error('❌ Error stack:', err.stack);
    res.status(500).json({ message: 'Lỗi gửi tin nhắn', error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;

  console.log(
    '🔍 Backend getMessages called for conversation:',
    conversationId
  );

  try {
    const [messages] = await db.execute(
      `SELECT m.*, u.email as sender_email, p.full_name as sender_name, p.avatar_url as sender_avatar
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       LEFT JOIN profile p ON u.id = p.user_id
       WHERE m.conversation_id = ?
       ORDER BY m.sent_at ASC`,
      [conversationId]
    );

    console.log(`🔍 Found ${messages.length} messages`);
    res.json(messages);
  } catch (err) {
    console.error('❌ Error getting messages:', err);
    res.status(500).json({ message: 'Lỗi lấy tin nhắn', error: err.message });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  const { conversation_id } = req.body;
  const user_id = req.user.id;

  console.log('🔍 markMessagesAsRead called:', { conversation_id, user_id });

  try {
    // Get all unread messages in this conversation for this user
    const [unreadMessages] = await db.execute(
      `SELECT m.id
       FROM messages m
       WHERE m.conversation_id = ?
       AND m.sender_id != ?
       AND m.id NOT IN (
         SELECT message_id FROM message_reads WHERE user_id = ?
       )`,
      [conversation_id, user_id, user_id]
    );

    console.log('🔍 Found unread messages:', unreadMessages.length);

    if (unreadMessages.length > 0) {
      // Insert read records for all unread messages
      const values = unreadMessages.map((msg) => [msg.id, user_id]);
      const placeholders = values.map(() => '(?, ?)').join(', ');
      const flatValues = values.flat();

      await db.execute(
        `INSERT INTO message_reads (message_id, user_id) VALUES ${placeholders}`,
        flatValues
      );

      console.log(`✅ Marked ${unreadMessages.length} messages as read`);
    }

    res.json({
      message: 'Messages marked as read',
      count: unreadMessages.length,
    });

    // Emit socket event to update unread count for other clients
    if (req.io && unreadMessages.length > 0) {
      req.io.emit('messages_marked_read', {
        conversation_id,
        user_id,
        count: unreadMessages.length,
      });
    }
  } catch (err) {
    console.error('❌ Error marking messages as read:', err);
    res
      .status(500)
      .json({ message: 'Lỗi đánh dấu tin nhắn đã đọc', error: err.message });
  }
};
