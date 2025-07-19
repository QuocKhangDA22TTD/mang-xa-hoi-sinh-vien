import { useState } from 'react';

// Composants simulés pour la démo
const Button = ({ children, onClick, className }) => (
  <button onClick={onClick} className={className}>
    {children}
  </button>
);

const Avatar = ({ className, src }) => (
  <div className={className}>
    <img 
      src={src} 
      alt="avatar" 
      className="w-full h-full object-cover rounded-full"
    />
  </div>
);

function PersonalProfile() {
  const [activeTab, setActiveTab] = useState('posts');
  
  // Dữ liệu mẫu
  const profileData = {
    name: 'Nguyễn Hoàng Lâm',
    username: '@nhlam',
    birthday: '18/5/2001',
    address: 'Trà Vinh',
    joinDate: '4/05/2025',
    bio: 'Tôi là sinh viên Công nghệ thông tin',
    avatarUrl: '/demo_avatar.jpg',
    coverUrl: '/demo_AnhBia.jpg'
  };

  const posts = [
    {
      id: 1,
      date: '12/3/2025',
      content: 'Hôm nay tôi đã hoàn thành đồ án!',
      timeAgo: '2 giờ trước',
      likes: 0
    },
    {
      id: 2,
      date: '12/3/2025', 
      content: 'Hôm nay trời mưa nhẹ, mình ngồi quán cà phê quen, gọi ly đen đá, bật một playlist cũ mà mình hay nghe hồi đại học. Chợt thấy một tru cần lại. Dạo này xưởng quay xong xếp, học bận nên không mình đi, ngày nào cũng như chạy đua với thời gian, nhiều lúc cảm thấy mệt mỏi. Có những ngày mình cũng nhân viên đáng cảm hỏa, vài người cẩm cụ laptop, ngoài đường xe cộ vân vội vã, má tử dung mình thấy bình yên hẳn lạ.',
      timeAgo: '2 giờ trước', 
      likes: 27
    }
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-[600px] bg-white rounded-[12px] shadow-lg overflow-hidden">
        {/* Cover Photo */}
        <div className="h-[160px] w-full bg-gradient-to-r from-green-400 to-blue-400 relative">
          <img
            src={profileData.coverUrl}
            alt="cover"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Content */}
        <div className="relative px-6 pb-6">
          {/* Avatar positioned over cover */}
          <div className="relative -mt-12 mb-4">
            <Avatar 
              className="w-[80px] h-[80px] rounded-full border-4 border-white shadow-lg" 
              src={profileData.avatarUrl}
            />
          </div>

          {/* Edit Profile Button - positioned at top right */}
          <div className="flex justify-end mb-2">
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors shadow-sm">
              Sửa hồ sơ
            </button>
          </div>

          {/* Name and Username */}
          <div className="mb-6 space-y-1">
            <h2 className="text-xl font-bold text-[#262626]">{profileData.name}</h2>
            <p className="text-[#0095F6] text-base">{profileData.username}</p>
          </div>

          {/* Info Fields */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm text-[#8E8E8E]">Sinh nhật:</span>
              <span className="text-[#262626] text-sm">{profileData.birthday}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm text-[#8E8E8E]">Địa chỉ:</span>
              <span className="text-[#262626] text-sm">{profileData.address}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm text-[#8E8E8E]">Tham gia từ:</span>
              <span className="text-[#262626] text-sm">{profileData.joinDate}</span>
            </div>
          </div>

          {/* Bio Box */}
          <div className="bg-[#F0E5E5] rounded-[8px] p-4 mb-6">
            <p className="text-[#262626] text-sm">{profileData.bio}</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-[#0095F6] text-[#0095F6]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Bài viết
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'photos'
                    ? 'border-[#0095F6] text-[#0095F6]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Ảnh
              </button>
            </nav>
          </div>

          {/* Posts Content */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-500">{post.date}</span>
                    <span className="text-xs text-gray-500">{post.timeAgo}</span>
                  </div>
                  <p className="text-sm text-[#262626] leading-relaxed mb-3">{post.content}</p>
                  <div className="flex justify-between items-center">
                    <button className="text-xs text-[#0095F6] hover:underline">
                      Bình luận
                    </button>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">{post.likes}</span>
                      <button className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 text-xs">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V8a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span>Like</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="text-center py-8">
              <p className="text-gray-500">Chưa có ảnh nào được chia sẻ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PersonalProfile;