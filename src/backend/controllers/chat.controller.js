const db = require('../config/db');

exports.createConversation = async (req, res) => {
  const { is_group, name, member_ids } = req.body;
  const admin_id = req.user.id;

  console.log('🔍 Backend createConversation called with:', {
    is_group,
    name,
    member_ids,
    admin_id,
  });

  try {
    console.log('🔍 Creating conversation in database...');
    const [result] = await db.execute(
      'INSERT INTO conversations (is_group, name, admin_id) VALUES (?, ?, ?)',
      [is_group || false, name || null, admin_id]
    );
    const conversationId = result.insertId;
    console.log('🔍 Created conversation with ID:', conversationId);

    // Thêm admin vào conversation
    console.log('🔍 Adding admin to conversation...');
    await db.execute(
      'INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)',
      [conversationId, admin_id]
    );

    // Thêm các members khác
    console.log('🔍 Adding members to conversation:', member_ids);
    for (const uid of member_ids) {
      await db.execute(
        'INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)',
        [conversationId, uid]
      );
    }

    console.log('🔍 Conversation created successfully');
    res.status(201).json({ conversationId });
  } catch (err) {
    console.error('❌ Error creating conversation:', err);
    res.status(500).json({
      message: 'Lỗi tạo cuộc trò chuyện',
      error: err.message,
    });
  }
};

exports.getMyConversations = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.execute(
      `
      SELECT c.*,
             GROUP_CONCAT(cm.user_id) as member_ids,
             (SELECT u.email FROM users u
              JOIN conversation_members cm2 ON u.id = cm2.user_id
              WHERE cm2.conversation_id = c.id AND cm2.user_id != ?
              LIMIT 1) as other_user_email,
             (SELECT cm2.user_id FROM conversation_members cm2
              WHERE cm2.conversation_id = c.id AND cm2.user_id != ?
              LIMIT 1) as other_user_id
      FROM conversations c
      JOIN conversation_members cm ON c.id = cm.conversation_id
      WHERE cm.user_id = ?
      GROUP BY c.id
    `,
      [userId, userId, userId]
    );

    console.log('🔍 Conversations for user', userId, ':', rows);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error getting conversations:', err);
    res.status(500).json({ message: 'Lỗi lấy danh sách hội thoại' });
  }
};

exports.sendMessage = async (req, res) => {
  const { conversation_id, text } = req.body;
  const sender_id = req.user.id;

  try {
    const [result] = await db.execute(
      'INSERT INTO messages (conversation_id, sender_id, text) VALUES (?, ?, ?)',
      [conversation_id, sender_id, text]
    );
    res.status(201).json({ messageId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi gửi tin nhắn' });
  }
};

exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;
  try {
    const [rows] = await db.execute(
      `SELECT m.*, u.email AS sender_email
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ?
        ORDER BY m.sent_at ASC`,
      [conversationId]
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ Lỗi lấy tin nhắn:', err); // 👈 Thêm dòng này
    res.status(500).json({ message: 'Lỗi lấy tin nhắn' });
  }
};
