const db = require('../config/db');

exports.createConversation = async (req, res) => {
  const { is_group, name, member_ids } = req.body;

  console.log('🔍 req.user:', req.user);

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const admin_id = req.user.id;

  console.log('🔍 Backend createConversation called with:', {
    is_group,
    name,
    member_ids,
    admin_id,
  });

  // Validate member_ids
  if (!member_ids || !Array.isArray(member_ids)) {
    return res.status(400).json({
      message: 'member_ids is required and must be an array',
    });
  }

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
          member_ids: existing.member_ids.split(',').map(Number),
        };

        return res.status(200).json({
          message: 'Conversation already exists',
          conversation: conversationObject,
        });
      }
    } catch (err) {
      console.error('❌ Error checking existing conversation:', err);
      // Continue to create new conversation if check fails
    }
  }

  try {
    console.log('🔍 About to create conversation with values:', {
      is_group,
      name,
      admin_id,
    });

    // Test database connection first
    await db.execute('SELECT 1');
    console.log('✅ Database connection OK');

    // Create conversation
    const [result] = await db.execute(
      `INSERT INTO conversations (is_group, name, admin_id, created_at)
       VALUES (?, ?, ?, NOW())`,
      [is_group, name, admin_id]
    );

    const conversationId = result.insertId;
    console.log('🔍 Created conversation with ID:', conversationId);

    // Add admin to conversation
    await db.execute(
      `INSERT INTO conversation_members (conversation_id, user_id, joined_at)
       VALUES (?, ?, NOW())`,
      [conversationId, admin_id]
    );

    // Add other members
    if (member_ids && Array.isArray(member_ids)) {
      for (const memberId of member_ids) {
        if (memberId && memberId !== admin_id) {
          // Don't add admin twice
          console.log('🔍 Adding member:', memberId);
          await db.execute(
            `INSERT INTO conversation_members (conversation_id, user_id, joined_at)
             VALUES (?, ?, NOW())`,
            [conversationId, memberId]
          );
        }
      }
    }

    // Get the created conversation with member info
    const [conversation] = await db.execute(
      `SELECT c.*, GROUP_CONCAT(cm.user_id) as member_ids
       FROM conversations c
       LEFT JOIN conversation_members cm ON c.id = cm.conversation_id
       WHERE c.id = ?
       GROUP BY c.id`,
      [conversationId]
    );

    // Get member details
    const memberIds = conversation[0].member_ids
      ? conversation[0].member_ids.split(',').map(Number)
      : [];

    let members = [];
    if (memberIds.length > 0) {
      const [memberDetails] = await db.execute(
        `SELECT u.id, u.email, u.is_online, u.last_active,
                p.full_name, p.nickname, p.avatar_url
         FROM users u
         LEFT JOIN profile p ON u.id = p.user_id
         WHERE u.id IN (${memberIds.map(() => '?').join(',')})`,
        memberIds
      );

      // For 1-on-1 conversations, only show the other person's info
      if (!is_group && memberDetails.length > 1) {
        // Filter out current user (admin_id), only show the other person
        members = memberDetails.filter((member) => member.id !== admin_id);
        console.log(
          `🔍 createConversation - Filtered members (excluding user ${admin_id}):`,
          members
        );
      } else {
        members = memberDetails;
        console.log(`🔍 createConversation - All members:`, members);
      }
    }

    const conversationObject = {
      id: conversation[0].id,
      is_group: conversation[0].is_group,
      name: conversation[0].name,
      admin_id: conversation[0].admin_id,
      created_at: conversation[0].created_at,
      avatar: conversation[0].avatar,
      member_ids: memberIds,
      members: members,
      message_count: 0,
      last_message: null,
      last_message_time: null,
      unread_count: 0,
    };

    console.log('🔍 Returning conversation object:', conversationObject);

    res.status(201).json({
      message: 'Tạo cuộc trò chuyện thành công',
      conversation: conversationObject,
    });
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
  console.log('🔍 User object:', req.user);

  try {
    // First, let's see all conversation_members for this user
    const [memberCheck] = await db.execute(
      `SELECT conversation_id FROM conversation_members WHERE user_id = ?`,
      [userId]
    );
    console.log('🔍 User is member of conversations:', memberCheck);

    const [conversations] = await db.execute(
      `SELECT DISTINCT c.id, c.is_group, c.name, c.admin_id, c.created_at, c.avatar,
              GROUP_CONCAT(DISTINCT cm.user_id ORDER BY cm.user_id) as member_ids,
              (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) as message_count,
              (SELECT text FROM messages m WHERE m.conversation_id = c.id ORDER BY m.sent_at DESC LIMIT 1) as last_message,
              (SELECT sent_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.sent_at DESC LIMIT 1) as last_message_time,
              (SELECT COUNT(*) FROM messages m
               WHERE m.conversation_id = c.id
               AND m.sender_id != ?
               AND m.id NOT IN (
                 SELECT message_id FROM message_reads mr WHERE mr.user_id = ?
               )) as unread_count
       FROM conversations c
       JOIN conversation_members cm ON c.id = cm.conversation_id
       WHERE c.id IN (
         SELECT DISTINCT conversation_id
         FROM conversation_members
         WHERE user_id = ?
       )
       GROUP BY c.id, c.is_group, c.name, c.admin_id, c.created_at, c.avatar
       ORDER BY (SELECT sent_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.sent_at DESC LIMIT 1) DESC, c.created_at DESC`,
      [userId, userId, userId]
    );

    console.log('🔍 Raw conversations from DB:', conversations);
    console.log('🔍 Number of conversations found:', conversations.length);

    // Transform the data
    const transformedConversations = conversations
      .filter((conv) => conv && conv.id) // Filter out null/undefined conversations
      .map((conv) => ({
        id: conv.id,
        is_group: conv.is_group,
        name: conv.name,
        admin_id: conv.admin_id,
        created_at: conv.created_at,
        avatar: conv.avatar,
        member_ids: conv.member_ids
          ? conv.member_ids.split(',').map(Number)
          : [],
        message_count: conv.message_count,
        last_message: conv.last_message,
        last_message_time: conv.last_message_time,
        unread_count: conv.unread_count || 0,
      }));

    // Add member details for each conversation
    const conversationsWithMembers = await Promise.all(
      transformedConversations.map(async (conv) => {
        if (conv.member_ids && conv.member_ids.length > 0) {
          try {
            const [memberDetails] = await db.execute(
              `SELECT u.id, u.email, u.is_online, u.last_active,
                      p.full_name, p.nickname, p.avatar_url
               FROM users u
               LEFT JOIN profile p ON u.id = p.user_id
               WHERE u.id IN (${conv.member_ids.map(() => '?').join(',')})`,
              conv.member_ids
            );

            // For 1-on-1 conversations, only show the other person's info
            let filteredMembers = memberDetails || [];
            if (!conv.is_group && filteredMembers.length > 1) {
              // Filter out current user, only show the other person
              filteredMembers = filteredMembers.filter(
                (member) => member.id !== userId
              );
            }

            console.log(`🔍 Conv ${conv.id} member_ids:`, conv.member_ids);
            console.log(`🔍 Conv ${conv.id} all members:`, memberDetails);
            console.log(
              `🔍 Conv ${conv.id} filtered members (excluding user ${userId}):`,
              filteredMembers
            );

            return {
              ...conv,
              members: filteredMembers,
            };
          } catch (memberError) {
            console.error('❌ Error fetching member details:', memberError);
            return {
              ...conv,
              members: [],
            };
          }
        }
        return {
          ...conv,
          members: [],
        };
      })
    );

    console.log('🔍 Conversations with members:', conversationsWithMembers);

    res.json(conversationsWithMembers);
  } catch (err) {
    console.error('❌ Error getting conversations:', err);
    res.status(500).json({ message: 'Lỗi lấy danh sách hội thoại' });
  }
};

// Get unread message count for each conversation
exports.getUnreadCounts = async (req, res) => {
  const userId = req.user.id;

  try {
    // For now, return empty unread counts since message_reads table doesn't exist
    // TODO: Implement proper unread tracking when message_reads table is created
    const unreadCounts = {};

    res.json(unreadCounts);
  } catch (err) {
    console.error('❌ Error getting unread counts:', err);
    res.status(500).json({ message: 'Lỗi lấy số tin nhắn chưa đọc' });
  }
};

// Add member to group
exports.addMemberToGroup = async (req, res) => {
  const { conversationId } = req.params;
  const { userId } = req.body;
  const adminId = req.user.id;

  console.log('🔍 Adding member to group:', {
    conversationId,
    userId,
    adminId,
  });
  console.log('🔍 req.body:', req.body);
  console.log('🔍 req.params:', req.params);

  // Validate userId
  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  try {
    // Check if conversation exists and user is admin
    const [conversation] = await db.execute(
      'SELECT * FROM conversations WHERE id = ? AND is_group = 1',
      [conversationId]
    );

    if (conversation.length === 0) {
      return res.status(404).json({ message: 'Nhóm chat không tồn tại' });
    }

    if (conversation[0].admin_id !== adminId) {
      return res
        .status(403)
        .json({ message: 'Chỉ admin mới có thể thêm thành viên' });
    }

    // Check if user is already a member
    const [existingMember] = await db.execute(
      'SELECT * FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    );

    if (existingMember.length > 0) {
      return res
        .status(400)
        .json({ message: 'Người dùng đã là thành viên của nhóm' });
    }

    // Add member to group
    await db.execute(
      'INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?)',
      [conversationId, userId]
    );

    res.json({ message: 'Thêm thành viên thành công' });
  } catch (error) {
    console.error('❌ Error adding member to group:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Remove member from group
exports.removeMemberFromGroup = async (req, res) => {
  const { conversationId, userId } = req.params;
  const adminId = req.user.id;

  console.log('🔍 Removing member from group:', {
    conversationId,
    userId,
    adminId,
  });

  try {
    // Check if conversation exists and user is admin
    const [conversation] = await db.execute(
      'SELECT * FROM conversations WHERE id = ? AND is_group = 1',
      [conversationId]
    );

    if (conversation.length === 0) {
      return res.status(404).json({ message: 'Nhóm chat không tồn tại' });
    }

    if (conversation[0].admin_id !== adminId) {
      return res
        .status(403)
        .json({ message: 'Chỉ admin mới có thể kick thành viên' });
    }

    // Cannot remove admin
    if (parseInt(userId) === adminId) {
      return res
        .status(400)
        .json({ message: 'Không thể kick admin khỏi nhóm' });
    }

    // Remove member from group
    const [result] = await db.execute(
      'DELETE FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'Người dùng không phải thành viên của nhóm' });
    }

    res.json({ message: 'Kick thành viên thành công' });
  } catch (error) {
    console.error('❌ Error removing member from group:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Get group members
exports.getGroupMembers = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user.id;

  try {
    // Check if user is member of the group
    const [memberCheck] = await db.execute(
      'SELECT * FROM conversation_members WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    );

    if (memberCheck.length === 0) {
      return res
        .status(403)
        .json({ message: 'Bạn không phải thành viên của nhóm này' });
    }

    // Get all members with user info
    const [members] = await db.execute(
      `SELECT u.id, u.email, p.full_name, p.nickname, p.avatar_url,
              cm.joined_at, c.admin_id,
              CASE WHEN u.id = c.admin_id THEN 1 ELSE 0 END as is_admin
       FROM conversation_members cm
       JOIN users u ON cm.user_id = u.id
       LEFT JOIN profile p ON u.id = p.user_id
       JOIN conversations c ON cm.conversation_id = c.id
       WHERE cm.conversation_id = ?
       ORDER BY is_admin DESC, cm.joined_at ASC`,
      [conversationId]
    );

    res.json(members);
  } catch (error) {
    console.error('❌ Error getting group members:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Update group info (name, avatar, etc.)
exports.updateGroupInfo = async (req, res) => {
  const { conversationId } = req.params;
  const { name, avatar } = req.body;
  const adminId = req.user.id;

  // Handle file upload for avatar
  const uploadedAvatar = req.file ? `/uploads/${req.file.filename}` : avatar;

  console.log('🔍 updateGroupInfo called:', {
    conversationId,
    name,
    avatar: uploadedAvatar,
    adminId,
    hasFile: !!req.file,
  });

  try {
    // Check if conversation exists and user is admin
    const [conversation] = await db.execute(
      'SELECT * FROM conversations WHERE id = ? AND is_group = 1',
      [conversationId]
    );

    if (conversation.length === 0) {
      return res.status(404).json({ message: 'Nhóm chat không tồn tại' });
    }

    if (conversation[0].admin_id !== adminId) {
      return res
        .status(403)
        .json({ message: 'Chỉ admin mới có thể sửa thông tin nhóm' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (name !== undefined && name !== null) {
      updates.push('name = ?');
      values.push(name);
    }

    if (uploadedAvatar !== undefined) {
      updates.push('avatar = ?');
      values.push(uploadedAvatar);
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ message: 'Không có thông tin nào để cập nhật' });
    }

    values.push(conversationId);

    // Update group info
    await db.execute(
      `UPDATE conversations SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    console.log('✅ Group info updated successfully');

    res.json({
      message: 'Cập nhật thông tin nhóm thành công',
      updated: { name, avatar: uploadedAvatar },
    });
  } catch (error) {
    console.error('❌ Error updating group info:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
