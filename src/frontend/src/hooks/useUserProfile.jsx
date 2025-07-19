// src/hooks/useUserProfile.js
import { useEffect, useState } from 'react';
import { getMe } from '../api/auth';
import { getProfileByUserId } from '../api/profile';

export default function useUserProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getMe();
        setUser(userData);

        const profileData = await getProfileByUserId(userData.id);
        setProfile(profileData);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu user/profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { user, profile, loading };
}
