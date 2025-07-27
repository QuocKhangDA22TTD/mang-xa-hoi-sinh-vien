import { useState, useRef } from 'react';

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

function CreateProfile() {
  const [profile, setProfile] = useState({
    full_name: '',
    nickname: '',
    birthday: '',
    address: '',
    bio: '',
    avatar_url: '',
    banner_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const navigate = useNavigate();
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const handleAvatarChange = (event) => {
    console.log('🔍 Avatar change triggered:', event.target.files);
    const file = event.target.files[0];
    if (file) {
      console.log('✅ File selected:', file.name, file.type, file.size);
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('✅ File read successfully');
        setAvatarUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('❌ No file selected');
    }
  };

  const handleUploadClick = () => {
    console.log('🔍 Upload button clicked');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = () => {
    alert('Hồ sơ đã được tạo!');
    // Gửi dữ liệu tới backend tại đây nếu cần
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="profile-card w-[600px] bg-white rounded-[8px] shadow-lg overflow-hidden">
        {/* Cover Photo */}
        <div className="cover-photo h-[180px] bg-[#0088cc]"></div>

        {/* Avatar Area */}
        <div className="relative flex justify-center -mt-16">
          <div className="relative w-[120px] h-[120px]">
            <div className="avatar-image w-full h-full border-4 border-white">
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-full h-full object-cover rounded-full"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <button
              onClick={handleUploadClick}
              type="button"
              className="avatar-upload-button absolute bottom-0 right-0 w-[28px] h-[28px] bg-[#1877f2] text-white flex items-center justify-center rounded-full cursor-pointer hover:bg-[#166fe5] transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Identity Section */}
        <div className="identity-section text-center pt-[70px]">
          <div className="flex justify-center items-center gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên của bạn"
              className="text-xl font-bold text-center border-none outline-none"
            />
            <span className="text-sm">✎</span>
          </div>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Biệt danh"
            className="text-sm text-[#0088cc] text-center border-none outline-none"
          />
        </div>

        {/* Details Box */}
        <div className="details-box px-8 py-6 mt-4 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-300 pb-2">
            <label className="detail-label text-base">Sinh nhật:</label>
            <Input
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="detail-value flex-1 text-right border-none outline-none"
            />
            <span className="ml-2">✎</span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-300 pb-2">
            <label className="detail-label text-base">Địa chỉ:</label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="detail-value flex-1 text-right border-none outline-none"
            />
            <span className="ml-2">✎</span>
          </div>
        </div>

        {/* Bio Box */}
        <div className="bio-box bg-[#e0d8d7] rounded-[8px] px-6 py-4 mx-8 mt-6 relative">
          <label className="bio-label block text-sm font-medium text-gray-700 mb-1">
            Tiểu sử
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full h-[90px] bg-transparent outline-none resize-none"
            placeholder="Giới thiệu về bạn..."
          />
          <span className="absolute top-2 right-3 text-gray-500">✎</span>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-6 mr-8 mb-6">
          <Button
            onClick={handleSubmit}
            className="submit-button w-[140px] h-[40px] bg-[#0099ff] text-white font-bold text-sm rounded-[6px] shadow-md hover:bg-blue-600"
          >
            TẠO HỒ SƠ
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CreateProfile;
