import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../api/auth';
import Header from '../features/newsfeed/Header';
import LeftBar from '../features/newsfeed/LeftBar';
import Content from '../features/newsfeed/Content';
import RightBar from '../features/newsfeed/RightBar';

function HomePage() {
  const [currentView, setCurrentView] = useState('newsfeed');
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const user = await getMe();
        const res = await fetch(
          `http://localhost:5000/api/profile/${user.id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (!res.ok) {
          // Chưa có hồ sơ
          navigate('/create-profile');
          return;
        }
      } catch (err) {
        console.warn('Lỗi khi kiểm tra profile:', err);
        navigate('/create-profile');
        return;
      } finally {
        setIsChecking(false);
      }
    };

    checkProfile();
  }, []);

  // Chặn render khi đang kiểm tra
  if (isChecking) return null;

  return (
    <div className="w-[100%] h-[100vh] bg-gradient-to-b from-[#FFFFFF] to-[#00A6FB]">
      <Header setCurrentView={setCurrentView} />
      <div className="w-[100%] h-[90%] p-4">
        <div className="flex w-[100%] h-[100%]">
          <LeftBar />
          <Content currentView={currentView} setCurrentView={setCurrentView} />
          <RightBar />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
