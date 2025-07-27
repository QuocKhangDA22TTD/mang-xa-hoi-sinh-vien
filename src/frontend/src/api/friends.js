// src/api/friends.js

const API_BASE = 'https://daring-embrace-production.up.railway.app/api/friend';

// Lấy danh sách bạn bè
export async function getFriends() {
  // Backend: app.use('/api/friends', friendRoutes) + router.get('/friends', ...)
  // = /api/friends/friends
  const url = `${API_BASE}/friends`;
  console.log('🔍 getFriends API call to:', url);
  const res = await fetch(url, {
    credentials: 'include',
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ getFriends API error:', res.status, errorText);
    throw new Error(
      `HTTP ${res.status}: ${errorText || 'Không lấy được danh sách bạn bè'}`
    );
  }

  const data = await res.json();
  console.log('✅ getFriends API response:', data);
  return data;
}

// Gửi lời mời kết bạn
export async function sendFriendRequest(receiverId) {
  const res = await fetch(`${API_BASE}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      receiver_id: receiverId,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không gửi được lời mời kết bạn');
  }

  return res.json();
}

// Lấy danh sách lời mời đã gửi
export async function getSentRequests() {
  const res = await fetch(`${API_BASE}/requests/sent`, {
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Không lấy được danh sách lời mời đã gửi');

  return res.json();
}

// Lấy danh sách lời mời đã nhận
export async function getReceivedRequests() {
  const res = await fetch(`${API_BASE}/requests/received`, {
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Không lấy được danh sách lời mời đã nhận');

  return res.json();
}

// Chấp nhận lời mời kết bạn
export async function acceptFriendRequest(requestId) {
  console.log('🔍 Calling acceptFriendRequest:', requestId);
  console.log('🔍 URL:', `${API_BASE}/requests/${requestId}/accept`);

  try {
    const res = await fetch(`${API_BASE}/requests/${requestId}/accept`, {
      method: 'PUT',
      credentials: 'include',
    });

    console.log('🔍 Response status:', res.status);

    if (!res.ok) {
      const error = await res.json();
      console.error('🔍 API Error:', error);
      throw new Error(error.message || 'Không chấp nhận được lời mời kết bạn');
    }

    const result = await res.json();
    console.log('🔍 Success result:', result);
    return result;
  } catch (error) {
    console.error('🔍 Fetch Error:', error);
    throw error;
  }
}

// Từ chối lời mời kết bạn
export async function declineFriendRequest(requestId) {
  const res = await fetch(`${API_BASE}/requests/${requestId}/decline`, {
    method: 'PUT',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không từ chối được lời mời kết bạn');
  }

  return res.json();
}

// Hủy kết bạn
export async function unfriend(friendId) {
  const res = await fetch(`${API_BASE}/friends/${friendId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không hủy được kết bạn');
  }

  return res.json();
}

// Lấy danh sách tất cả users (để tìm kiếm)
export async function getAllUsers(search = '') {
  const url = new URL(`${API_BASE}/users`);
  if (search) {
    url.searchParams.append('search', search);
  }

  const res = await fetch(url, {
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Không lấy được danh sách người dùng');

  return res.json();
}
