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

// Gửi tin nhắn
export async function sendMessage(conversationId, text) {
  const res = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      conversation_id: conversationId,
      text,
    }),
  });

  if (!res.ok) throw new Error('Không gửi được tin nhắn');

  return res.json();
}

// Tạo cuộc trò chuyện mới
export async function createConversation(
  memberIds,
  isGroup = false,
  name = null
) {
  console.log('🔍 API createConversation called with:', {
    memberIds,
    isGroup,
    name,
  });

  const requestBody = {
    member_ids: memberIds,
    is_group: isGroup,
    name,
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
    return result;
  } catch (error) {
    console.error('🔍 Fetch Error:', error);
    throw error;
  }
}
