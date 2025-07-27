// src/api/chat.js

const API_BASE = 'http://localhost:5000/api/chat';

// Lấy danh sách cuộc trò chuyện của user hiện tại
export async function getMyConversations() {
  const res = await fetch(`${API_BASE}/conversations/me`, {
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Không lấy được danh sách cuộc trò chuyện');

  return res.json();
}

// Lấy tin nhắn trong một cuộc trò chuyện
export async function getMessages(conversationId) {
  const res = await fetch(`${API_BASE}/messages/${conversationId}`, {
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Không lấy được tin nhắn');

  return res.json();
}

// Gửi tin nhắn text
export async function sendMessage(conversationId, text) {
  console.log('🔍 API sendMessage called with:', { conversationId, text });

  const res = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      conversation_id: conversationId,
      text,
      message_type: 'text',
    }),
  });

  console.log('🔍 sendMessage response status:', res.status);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error('🔍 sendMessage error:', errorData);
    throw new Error(
      errorData.message || `Không gửi được tin nhắn (${res.status})`
    );
  }

  const result = await res.json();
  console.log('🔍 sendMessage success:', result);
  return result;
}

// Gửi file/ảnh
export async function sendFileMessage(conversationId, file, text = '') {
  console.log('🔍 API sendFileMessage called with:', {
    conversationId,
    file: file.name,
    text,
  });

  const formData = new FormData();
  formData.append('conversation_id', conversationId);
  formData.append('text', text);
  formData.append(
    'message_type',
    file.type.startsWith('image/') ? 'image' : 'file'
  );
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/messages/file`, {
    method: 'POST',
    credentials: 'include',
    body: formData, // Don't set Content-Type header, let browser set it with boundary
  });

  console.log('🔍 sendFileMessage response status:', res.status);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error('🔍 sendFileMessage error:', errorData);
    throw new Error(errorData.message || `Không gửi được file (${res.status})`);
  }

  const result = await res.json();
  console.log('🔍 sendFileMessage success:', result);
  return result;
}

// Tạo cuộc trò chuyện mới
export async function createConversation(conversationData) {
  console.log('🔍 API createConversation called with:', conversationData);

  const requestBody = {
    member_ids: conversationData.member_ids,
    is_group: conversationData.is_group,
    name: conversationData.name,
  };

  console.log('🔍 Request body:', requestBody);
  console.log('🔍 URL:', `${API_BASE}/conversations`);

  try {
    const res = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(requestBody),
    });

    console.log('🔍 Response status:', res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('🔍 API Error response:', errorText);
      throw new Error(
        `Không tạo được cuộc trò chuyện: ${res.status} ${errorText}`
      );
    }

    const result = await res.json();
    console.log('🔍 API Success result:', result);
    return result.conversation || result;
  } catch (error) {
    console.error('🔍 Fetch Error:', error);
    throw error;
  }
}

// Get unread message counts
export async function getUnreadCounts() {
  const res = await fetch(`${API_BASE}/unread-counts`, {
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Không lấy được số tin nhắn chưa đọc');

  return res.json();
}

// Mark messages as read
export async function markMessagesAsRead(conversationId) {
  const res = await fetch(`${API_BASE}/mark-read`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      conversation_id: conversationId,
    }),
  });

  if (!res.ok) throw new Error('Không đánh dấu được tin nhắn đã đọc');

  return res.json();
}

// Update group info (name, avatar)
export async function updateGroupInfo(conversationId, data) {
  console.log('🔍 API - Updating group info:', { conversationId, data });

  const res = await fetch(`${API_BASE}/conversations/${conversationId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Không thể cập nhật thông tin nhóm');
  }

  const result = await res.json();
  console.log('🔍 API - Update group info response:', result);
  return result;
}

// Upload group avatar
export async function uploadGroupAvatar(conversationId, file) {
  console.log('🔍 API - Uploading group avatar:', { conversationId, file });

  const formData = new FormData();
  formData.append('avatar', file);

  const res = await fetch(
    `${API_BASE}/conversations/${conversationId}/avatar`,
    {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error('Không thể upload avatar nhóm');
  }

  const result = await res.json();
  console.log('🔍 API - Upload group avatar response:', result);
  return result;
}
