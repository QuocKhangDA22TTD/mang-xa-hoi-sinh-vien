// src/api/auth.js
export async function getMe() {
  const res = await fetch('http://localhost:5000/api/auth/me', {
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Không lấy được thông tin user');

  const data = await res.json();
  return data.user;
}

export async function logout() {
  const res = await fetch('https://mang-xa-hoi-sinh-vien-production.up.railway.app:50024/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Đăng xuất thất bại');
}
