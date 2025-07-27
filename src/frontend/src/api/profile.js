export async function getProfileByUserId(userId) {
  const res = await fetch(`https://daring-embrace-production.up.railway.app/api/profile/${userId}`, {
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Không lấy được thông tin hồ sơ');

  const data = await res.json();
  return data;
}
