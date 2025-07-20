import { useState, useEffect } from 'react';
import axios from 'axios';

// Nút bấm cơ bản
const Button = ({ children, onClick, className }) => (
  <button onClick={onClick} className={className}>
    {children}
  </button>
);

// Input cơ bản
const Input = ({ value, onChange, className, placeholder }) => (
  <input
    value={value}
    onChange={onChange}
    className={className}
    placeholder={placeholder}
  />
);

// Toast thông báo
const Toast = ({ message, onClose, type }) => (
  <div
    className={`fixed top-4 right-4 p-4 rounded-lg text-white ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`}
  >
    {message}
    <button onClick={onClose} className="ml-2 font-bold">
      ×
    </button>
  </div>
);

// Avatar upload
const Avatar = ({ className, src, onImageChange }) => (
  <div className={className}>
    <img
      src={src}
      alt="avatar"
      className="w-full h-full object-cover rounded-full"
    />
    <input
      type="file"
      accept="image/*"
      onChange={onImageChange}
      className="hidden"
      id="avatar-upload"
    />
  </div>
);

// Hàm upload ảnh đến backend
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch('http://localhost:5000/api/upload', {
    method: 'POST',
    body: formData,
    headers: {},
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Upload thất bại');
  }

  const data = await res.json();
  return data.url;
};

function CreateAPersonalProfile() {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthday, setBirthday] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('/demo_avatar.jpg');
  const [coverUrl, setCoverUrl] = useState('/demo_AnhBia.jpg');

  const token = localStorage.getItem('token');

  const getUserIdFromToken = () => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload.user_id;
    } catch {
      return null;
    }
  };

  // Lấy dữ liệu profile nếu có
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/profile/${getUserIdFromToken()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { full_name, bio, avatar_url, nickname, birthday, address } =
          res.data;

        setName(full_name || '');
        setBio(bio || '');
        setAvatarUrl(avatar_url || '/demo_avatar.jpg');
        setNickname(nickname || '');
        setBirthday(birthday || '');
        setAddress(address || '');
      } catch (err) {
        console.warn('Chưa có profile hoặc lỗi khi tải', err);
      }
    };

    fetchProfile();
  }, []);

  // Xử lý upload avatar
  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const url = await uploadImage(file);
      setAvatarUrl(url);
      setMessage('Upload avatar thành công');
    } catch (err) {
      setMessage('Upload avatar thất bại');
    }
  };

  // Xử lý upload cover
  const handleCoverChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const url = await uploadImage(file);
      setCoverUrl(url);
      setMessage('Upload ảnh bìa thành công');
    } catch (err) {
      setMessage('Upload ảnh bìa thất bại');
    }
  };

  // Gửi API tạo/cập nhật hồ sơ
  const handleCreateProfile = async () => {
    if (!name.trim()) {
      setMessage('Vui lòng nhập tên của bạn');
      return;
    }

    try {
      // Kiểm tra hồ sơ đã tồn tại chưa
      const res = await fetch(`/api/profile/${getUserIdFromToken()}`, {
        method: 'GET',
        credentials: 'include', // gửi cookie xác thực
      });

      if (res.ok) {
        // Nếu hồ sơ tồn tại → cập nhật
        await fetch('http://localhost:5000/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            full_name: name,
            bio,
            avatar_url: avatarUrl,
            nickname,
            birthday,
            address,
          }),
        });
        setMessage('Cập nhật hồ sơ thành công');
      } else {
        throw new Error(); // Không tồn tại → tạo mới
      }
    } catch {
      try {
        await fetch('http://localhost:5000/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            full_name: name,
            bio,
            avatar_url: avatarUrl,
            nickname,
            birthday,
            address,
          }),
        });
        setMessage('Tạo hồ sơ thành công');
      } catch (err) {
        setMessage('Tạo hồ sơ thất bại');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-[600px] bg-white rounded-[12px] shadow-lg overflow-hidden">
        {/* Cover Photo */}
        <div className="h-[160px] w-full bg-gradient-to-r from-green-400 to-blue-400 relative">
          <img
            src={coverUrl}
            alt="cover"
            className="w-full h-full object-cover"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="hidden"
            id="cover-upload"
          />
          <label
            htmlFor="cover-upload"
            className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer hover:bg-opacity-70 transition-all"
          >
            <span className="text-white text-sm">✎</span>
          </label>
        </div>

        {/* Profile Content */}
        <div className="relative px-6 pb-6">
          <div className="relative -mt-12 mb-6">
            <div className="relative inline-block">
              <Avatar
                className="w-[80px] h-[80px] rounded-full border-4 border-white shadow-lg"
                src={avatarUrl}
                onImageChange={handleAvatarChange}
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-[24px] h-[24px] bg-[#0095F6] rounded-full flex items-center justify-center border-2 border-white cursor-pointer hover:bg-blue-600 transition-colors"
              >
                <span className="text-white text-xs font-bold">✎</span>
              </label>
            </div>
          </div>

          {/* Name & Nickname */}
          <div className="mb-6 space-y-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên của bạn"
              className="text-xl font-bold text-[#262626] w-full bg-transparent border-none outline-none p-0"
            />
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Biệt danh"
              className="text-[#0095F6] text-base w-full bg-transparent border-none outline-none p-0"
            />
          </div>

          {/* Info fields */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <label className="text-sm text-[#8E8E8E] min-w-[80px]">
                Sinh nhật:
              </label>
              <Input
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="flex-1 ml-4 text-[#262626] bg-transparent border-none outline-none text-right"
              />
              <span className="text-gray-400 ml-2">✎</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <label className="text-sm text-[#8E8E8E] min-w-[80px]">
                Địa chỉ:
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nhập địa chỉ"
                className="flex-1 ml-4 text-[#262626] bg-transparent border-none outline-none text-right"
              />
              <span className="text-gray-400 ml-2">✎</span>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-[#F0E5E5] rounded-[8px] p-4 mb-6 relative">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="w-full resize-none bg-transparent text-[#262626] text-sm outline-none"
              placeholder="Tiểu sử..."
            />
            <div className="absolute top-2 right-2">
              <span className="text-gray-400 text-sm">✎</span>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleCreateProfile}
              className="bg-[#0095F6] text-white font-bold px-8 py-3 rounded-[8px] hover:bg-blue-600 transition-colors text-sm shadow-md"
            >
              LƯU HỒ SƠ
            </Button>
          </div>
        </div>
      </div>

      {/* Thông báo */}
      {message && (
        <Toast
          message={message}
          onClose={() => setMessage('')}
          type={message.includes('thành công') ? 'success' : 'error'}
        />
      )}
    </div>
  );
}

export default CreateAPersonalProfile;
