import { useState } from 'react';

// Composants simulés pour la démo
const Button = ({ children, onClick, className }) => (
  <button onClick={onClick} className={className}>
    {children}
  </button>
);

const Input = ({ value, onChange, className, placeholder }) => (
  <input
    value={value}
    onChange={onChange}
    className={className}
    placeholder={placeholder}
  />
);

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

function EditUserProfile() {
  const [name, setName] = useState('Nguyễn Hoàng Lâm');
  const [username, setUsername] = useState('@nhlam');
  const [birthday, setBirthday] = useState('18/5/2001');
  const [address, setAddress] = useState('Trà Vinh');
  const [bio, setBio] = useState('Tôi là sinh viên Công nghệ thông tin');
  const [message, setMessage] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('/demo_avatar.jpg');
  const [coverUrl, setCoverUrl] = useState('/demo_AnhBia.jpg');

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    try {
      // Simulation d'une requête API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage('Cập nhật thành công');
    } catch (err) {
      setMessage(err.message || 'Cập nhật thất bại');
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
          {/* Avatar positioned over cover */}
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

          {/* Name and Username */}
          <div className="mb-6 space-y-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xl font-bold text-[#262626] w-full bg-transparent border-none outline-none p-0"
            />
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="text-[#0095F6] text-base w-full bg-transparent border-none outline-none p-0"
            />
          </div>

          {/* Info Fields */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <label className="text-sm text-[#8E8E8E] min-w-[80px]">
                Sinh nhật:
              </label>
              <Input
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
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
                className="flex-1 ml-4 text-[#262626] bg-transparent border-none outline-none text-right"
              />
              <span className="text-gray-400 ml-2">✎</span>
            </div>
          </div>

          {/* Bio Box */}
          <div className="bg-[#F0E5E5] rounded-[8px] p-4 mb-6 relative">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="w-full resize-none bg-transparent text-[#262626] text-sm outline-none"
              placeholder="Parlez-vous un peu de vous..."
            />
            <div className="absolute top-2 right-2">
              <span className="text-gray-400 text-sm">✎</span>
            </div>
          </div>

          {/* Update Button */}
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleUpdate}
              className="bg-[#0095F6] text-white font-bold px-8 py-3 rounded-[8px] hover:bg-blue-600 transition-colors text-sm shadow-md"
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
