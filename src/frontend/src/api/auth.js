// src/api/auth.js
export async function getMe() {
  console.log('🔍 getMe: Checking cookies:', document.cookie);

  const res = await fetch('https://daring-embrace-production.up.railway.app/api/auth/me', {
    credentials: 'include',
  });

  console.log('🔍 getMe response status:', res.status);

  if (!res.ok) {
    console.log('❌ getMe failed:', res.status, res.statusText);
    throw new Error('Không lấy được thông tin user');
  }

  const data = await res.json();
  console.log('✅ getMe success:', data);
  return data.user;
}

export async function logout() {
  const res = await fetch('https://daring-embrace-production.up.railway.app/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Đăng xuất thất bại');
}
