// src/api/friends.js

const API_BASE = 'http://localhost:5000/api/friends';

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
  const res = await fetch(`${API_BASE}/requests/${requestId}/accept`, {
    method: 'PUT',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không chấp nhận được lời mời kết bạn');
  }

  return res.json();
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

// Lấy danh sách bạn bè
export async function getFriends() {
  const res = await fetch(`${API_BASE}/friends`, {
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Không lấy được danh sách bạn bè');

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
