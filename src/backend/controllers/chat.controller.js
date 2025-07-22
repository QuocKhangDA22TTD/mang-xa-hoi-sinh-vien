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

  // Check if conversation already exists before creating
  if (!is_group && member_ids.length === 1) {
    const otherUserId = member_ids[0];
    console.log(
      '🔍 Checking for existing 1-on-1 conversation between',
      admin_id,
      'and',
      otherUserId
    );

    try {
      const [existingConv] = await db.execute(
        `
        SELECT c.*, GROUP_CONCAT(DISTINCT cm.user_id ORDER BY cm.user_id) as member_ids
        FROM conversations c
        JOIN conversation_members cm ON c.id = cm.conversation_id
        WHERE c.is_group = 0
        GROUP BY c.id
        HAVING (
          member_ids = ? OR
          member_ids = ?
        )
      `,
        [`${admin_id},${otherUserId}`, `${otherUserId},${admin_id}`]
      );

      console.log('🔍 Found existing conversations:', existingConv);

      if (existingConv.length > 0) {
        console.log(
          '🔍 Returning existing conversation instead of creating new'
        );
        const existing = existingConv[0];
        const conversationObject = {
          id: existing.id,
          is_group: existing.is_group,
          name: existing.name,
          admin_id: existing.admin_id,
          created_at: existing.created_at,
          members: existing.member_ids
            .split(',')
            .map((id) => ({ user_id: parseInt(id) })),
        };
        return res.status(200).json(conversationObject);
      }
    } catch (checkError) {
      console.log('🔍 Error checking existing conversation:', checkError);
      // Continue to create new conversation
    }
  }

  try {
    console.log('🔍 Creating conversation in database...');
    const [result] = await db.execute(
      'INSERT INTO conversations (is_group, name, admin_id) VALUES (?, ?, ?)',
      [is_group || false, name || null, admin_id]
    );
    const conversationId = result.insertId;
    console.log('🔍 Created conversation with ID:', conversationId);

    // Thêm tất cả members (bao gồm admin) vào conversation
    const allMembers = [
      admin_id,
      ...member_ids.filter((id) => id !== admin_id),
    ];
    console.log('🔍 Adding all members to conversation:', allMembers);

    for (const uid of allMembers) {
      await db.execute(
        'INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)',
        [conversationId, uid]
      );
    }

    console.log('🔍 Conversation created successfully');

    // Return full conversation object with members
    const conversationObject = {
      id: conversationId,
      is_group: is_group || false,
      name: name || null,
      admin_id,
      created_at: new Date().toISOString(),
      members: allMembers.map((id) => ({ user_id: id })),
    };

    res.status(201).json(conversationObject);
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
  console.log('🔍 getMyConversations called for user:', userId);

  try {
    // First, let's see all conversation_members for this user
    const [memberRows] = await db.execute(
      'SELECT * FROM conversation_members WHERE user_id = ?',
      [userId]
    );
    console.log('🔍 User is member of conversations:', memberRows);

    const [rows] = await db.execute(
      `
      SELECT c.*,
             GROUP_CONCAT(DISTINCT cm.user_id ORDER BY cm.user_id) as member_ids,
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
      GROUP BY c.id, c.is_group, c.name, c.admin_id, c.created_at
      ORDER BY c.created_at DESC
    `,
      [userId, userId, userId]
    );

    // Transform data to include members array
    const transformedRows = rows.map((row) => ({
      ...row,
      members: row.member_ids
        ? row.member_ids.split(',').map((id) => ({
            user_id: parseInt(id),
          }))
        : [],
    }));

    console.log('🔍 Raw conversations from DB:', rows);
    console.log(
      '🔍 Transformed conversations for user',
      userId,
      ':',
      transformedRows
    );

    // Also check all conversations in database
    const [allConversations] = await db.execute('SELECT * FROM conversations');
    console.log('🔍 All conversations in DB:', allConversations);

    const [allMembers] = await db.execute('SELECT * FROM conversation_members');
    console.log('🔍 All conversation members in DB:', allMembers);
    res.json(transformedRows);
  } catch (err) {
    console.error('❌ Error getting conversations:', err);
    res.status(500).json({ message: 'Lỗi lấy danh sách hội thoại' });
  }
};

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
    attachment_url = `http://localhost:5000/uploads/${req.file.filename}`;
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
      // Use old schema - just text
      [result] = await db.execute(
        'INSERT INTO messages (conversation_id, sender_id, text) VALUES (?, ?, ?)',
        [conversation_id, sender_id, text || '']
      );
    }

    console.log('🔍 Message inserted with ID:', result.insertId);

    // Get conversation members to send real-time notifications
    const [members] = await db.execute(
      'SELECT user_id FROM conversation_members WHERE conversation_id = ?',
      [conversation_id]
    );

    const messageData = {
      id: result.insertId,
      messageId: result.insertId,
      conversation_id,
      sender_id,
      text: text || '',
      message_type: hasNewColumns ? message_type : 'text',
      attachment_url: hasNewColumns ? attachment_url : null,
      sent_at: new Date().toISOString(),
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

    res.status(201).json(messageData);
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
    const [rows] = await db.execute(
      `SELECT m.*, u.email AS sender_email
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ?
        ORDER BY m.sent_at ASC`,
      [conversationId]
    );

    console.log('🔍 Found messages:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('❌ Lỗi lấy tin nhắn:', err);
    res.status(500).json({ message: 'Lỗi lấy tin nhắn', error: err.message });
  }
};

// Get unread message count for each conversation
exports.getUnreadCounts = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.execute(
      `
      SELECT
        m.conversation_id,
        COUNT(*) as unread_count
      FROM messages m
      JOIN conversation_members cm ON m.conversation_id = cm.conversation_id
      WHERE cm.user_id = ?
        AND m.sender_id != ?
        AND m.id NOT IN (
          SELECT message_id
          FROM message_reads
          WHERE user_id = ?
        )
      GROUP BY m.conversation_id
    `,
      [userId, userId, userId]
    );

    console.log('🔍 Unread counts for user', userId, ':', rows);

    // Convert to object for easier lookup
    const unreadCounts = {};
    rows.forEach((row) => {
      unreadCounts[row.conversation_id] = Math.min(row.unread_count, 5); // Cap at 5
    });

    res.json(unreadCounts);
  } catch (err) {
    console.error('❌ Error getting unread counts:', err);
    res.status(500).json({ message: 'Lỗi lấy số tin nhắn chưa đọc' });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  const { conversation_id } = req.body;
  const user_id = req.user.id;

  try {
    // Get all unread messages in this conversation
    const [unreadMessages] = await db.execute(
      `
      SELECT m.id
      FROM messages m
      WHERE m.conversation_id = ?
        AND m.sender_id != ?
        AND m.id NOT IN (
          SELECT message_id
          FROM message_reads
          WHERE user_id = ?
        )
    `,
      [conversation_id, user_id, user_id]
    );

    // Mark them as read
    for (const message of unreadMessages) {
      await db.execute(
        'INSERT IGNORE INTO message_reads (message_id, user_id) VALUES (?, ?)',
        [message.id, user_id]
      );
    }

    console.log(
      '🔍 Marked',
      unreadMessages.length,
      'messages as read for user',
      user_id
    );
    res.json({ marked_count: unreadMessages.length });
  } catch (err) {
    console.error('❌ Error marking messages as read:', err);
    res.status(500).json({ message: 'Lỗi đánh dấu tin nhắn đã đọc' });
  }
};
