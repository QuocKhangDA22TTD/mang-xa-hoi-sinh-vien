const db = require('../config/db');

exports.createConversation = async (req, res) => {
  const { is_group, name, member_ids } = req.body;
  const admin_id = req.user.id;

  try {
    const [result] = await db.execute(
      'INSERT INTO conversations (is_group, name, admin_id) VALUES (?, ?, ?)',
      [is_group || false, name || null, admin_id]
    );
    const conversationId = result.insertId;

    for (const uid of member_ids) {
      await db.execute(
        'INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)',
        [conversationId, uid]
      );
    }

    res.status(201).json({ conversationId });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi tạo cuộc trò chuyện' });
  }
};

exports.getMyConversations = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.execute(
      `
      SELECT c.* FROM conversations c
      JOIN conversation_members cm ON c.id = cm.conversation_id
      WHERE cm.user_id = ?
    `,
      [userId]
    );
    res.json(rows);
  } catch (err) {
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
