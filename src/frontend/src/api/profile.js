export async function getProfileByUserId(userId) {
  const res = await fetch(`http://localhost:5000/api/profile/${userId}`, {
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Không lấy được thông tin hồ sơ');

  const data = await res.json();
  return data;
}
