import { useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Toast from '../components/Toast';
import Avatar from '../features/post/Avatar';

function EditUserProfile() {
  const [name, setName] = useState('Nguyễn Hoàng Lâm');
  const [username, setUsername] = useState('@nhlam');
  const [birthday, setBirthday] = useState('18/5/2001');
  const [address, setAddress] = useState('Trà Vinh');
  const [bio, setBio] = useState('Tôi là sinh viên Công nghệ thông tin');
  const [message, setMessage] = useState('');

  const handleUpdate = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, birthday, address, bio }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Cập nhật thất bại');

      setMessage('Cập nhật thành công');
    } catch (err) {
      setMessage(err.message || 'Cập nhật thất bại');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 p-6">
      <div className="w-[800px] bg-white rounded-[12px] shadow-xl">
        {/* Cover Photo */}
        <div className="h-[220px] w-full rounded-t-[12px] overflow-hidden">
          <img
            src="/demo_AnhBia.jpg"
            alt="cover"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Avatar and Name Block */}
        <div className="relative px-6 pt-6 pb-4">
          <div className="flex flex-col items-start mb-4">
            <div className="relative">
              <Avatar className="w-[100px] h-[100px] rounded-full overflow-hidden" />
              <div className="absolute bottom-0 right-0 w-[20px] h-[20px] bg-[#0095F6] rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">+</span>
              </div>
            </div>
          </div>
          <div className="text-left mt-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xl font-bold text-[#262626] w-full"
            />
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="text-[#0095F6] text-base w-full"
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="px-6">
          <div className="border border-[#DBDBDB] rounded-[8px] p-4 mt-6 space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm text-[#8E8E8E] w-24">Sinh nhật:</label>
              <Input
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="flex-1 ml-4 text-[#262626] border border-[#EFEFEF] rounded px-2 py-1"
              />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm text-[#8E8E8E] w-24">Địa chỉ:</label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1 ml-4 text-[#262626] border border-[#EFEFEF] rounded px-2 py-1"
              />
            </div>
          </div>

          {/* Bio Box */}
          <div className="bg-[#F0E5E5] rounded-[8px] p-4 mt-6">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full resize-none bg-transparent text-[#262626] text-base outline-none"
            />
          </div>

          {/* Update Button */}
          <div className="flex justify-end mt-8 mb-2">
            <Button
              onClick={handleUpdate}
              className="bg-[#0095F6] text-white font-bold px-8 py-2 rounded-[8px] hover:bg-blue-600 transition-colors"
            >
              CẬP NHẬT
            </Button>
          </div>
        </div>
      </div>

      {/* Toast message */}
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

export default EditUserProfile;