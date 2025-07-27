import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../api/auth';
import { 
  FaUser, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaEdit, 
  FaCamera,
  FaArrowLeft,
  FaSave,
  FaTimes
} from 'react-icons/fa';

function CreateProfile() {
  const [formData, setFormData] = useState({
    full_name: '',
    nickname: '',
    birthday: '',
    address: '',
    bio: '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    try {
      const user = await getMe();
      const response = await fetch(`http://localhost:5000/api/profile/${user.id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const profile = await response.json();
        setFormData({
          full_name: profile.full_name || '',
          nickname: profile.nickname || '',
          birthday: profile.birthday ? profile.birthday.split('T')[0] : '',
          address: profile.address || '',
          bio: profile.bio || '',
          avatar_url: profile.avatar_url || ''
        });
        setIsEdit(true);
      }
    } catch (err) {
      console.log('No existing profile found');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const method = isEdit ? 'PUT' : 'POST';
      const response = await fetch('http://localhost:5000/api/profile', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(isEdit ? 'Cập nhật profile thành công!' : 'Tạo profile thành công!');
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEdit ? 'Chỉnh sửa profile' : 'Tạo profile'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={formData.avatar_url || '/demo_avatar.jpg'}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                />
                <button
                  type="button"
                  className="absolute bottom-2 right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
                >
                  <FaCamera className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Click vào camera để thay đổi ảnh đại diện
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <FaUser className="w-5 h-5 mr-2 text-blue-600" />
              Thông tin cá nhân
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên hiển thị *
                </label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  placeholder="Nhập tên hiển thị"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <FaCalendarAlt className="w-4 h-4 mr-1" />
                  Ngày sinh *
                </label>
                <input
                  type="date"
                  name="birthday"
                  value={formData.birthday}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <FaMapMarkerAlt className="w-4 h-4 mr-1" />
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <FaEdit className="w-4 h-4 mr-1" />
                Giới thiệu bản thân
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors resize-none"
                placeholder="Viết vài dòng giới thiệu về bản thân..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <FaTimes className="w-4 h-4" />
              <span>Hủy</span>
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4" />
                  <span>{isEdit ? 'Cập nhật' : 'Tạo profile'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Toast Messages */}
        {error && (
          <div className="fixed top-6 right-6 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50">
            <div className="flex items-center space-x-2">
              <FaTimes className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="fixed top-6 right-6 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50">
            <div className="flex items-center space-x-2">
              <FaSave className="w-4 h-4" />
              <span>{success}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateProfile;
