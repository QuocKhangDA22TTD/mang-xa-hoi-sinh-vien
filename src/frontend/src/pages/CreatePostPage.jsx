import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../styles/quill-custom.css';
import EmojiPicker from 'emoji-picker-react';
import PostTitle from '../features/post/PostTitle';
import Avatar from '../features/post/Avatar';
import Button from '../components/Button';
import useUserProfile from '../hooks/useUserProfile';
import { useTheme } from '../contexts/ThemeContext';
import {
  FaArrowLeft,
  FaImage,
  FaSmile,
  FaLink,
  FaPaperPlane,
  FaTimes,
} from 'react-icons/fa';

function CreatePostPage() {
  const [value, setValue] = useState('');
  const [title, setTitle] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { user, profile, loading } = useUserProfile();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const quillRef = useRef();
  const fileInputRef = useRef();
  const emojiPickerRef = useRef();

  const handleSubmitPost = async () => {
    const postData = {
      user_id: user.id,
      title: title,
      content: value,
    };

    try {
      const res = await fetch('https://daring-embrace-production.up.railway.app/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(postData),
      });

      if (!res.ok) throw new Error('Gửi bài thất bại');
      const result = await res.json();
      console.log('Đăng thành công:', result);
      alert('Đăng bài thành công');
      setTitle('');
      setValue('');
      // Quay về trang chủ sau khi đăng bài thành công với timestamp để force refresh
      navigate('/', {
        replace: true,
        state: { refresh: Date.now() },
      });
    } catch (err) {
      console.error(err);
      alert('Lỗi khi đăng bài');
    }
  };

  // Chèn ảnh từ file người dùng chọn
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file); // key 'image' phải giống tên trong upload.single('image')

    try {
      const res = await fetch('https://daring-embrace-production.up.railway.app/api/upload', {
        method: 'POST',
        body: formData, // KHÔNG có headers 'Content-Type' (để fetch tự thêm multipart)
      });

      const data = await res.json();
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true);
      editor.insertEmbed(range.index, 'image', data.url); // chèn URL ảnh từ server
    } catch (err) {
      console.error('Lỗi upload ảnh:', err);
      alert('Tải ảnh thất bại');
    }
  };

  // Mở input file
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const insertLink = () => {
    const url = prompt('Nhập URL liên kết:');
    const text = prompt('Text hiển thị:') || 'Link';
    if (!url) return;
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true);
    editor.insertText(range.index, text);
    editor.formatText(range.index, text.length, { link: url });
  };

  const onEmojiClick = (emojiData) => {
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true);
    editor.insertText(range.index, emojiData.emoji);
  };

  const toggleEmojiPicker = () => setShowEmojiPicker(!showEmojiPicker);

  // Hàm xử lý khi muốn rời khỏi trang
  const handleCancel = () => {
    if (title.trim() || value.trim()) {
      if (window.confirm('Bạn có chắc muốn hủy? Nội dung sẽ bị mất.')) {
        navigate('/', {
          replace: true,
          state: { refresh: Date.now() },
        });
      }
    } else {
      navigate('/', {
        replace: true,
        state: { refresh: Date.now() },
      });
    }
  };

  // Đóng emoji picker khi click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Tùy chỉnh toolbar: chỉ giữ các chức năng cơ bản
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Tạo bài viết mới
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Author Info & Title */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar avatarUrl={profile.avatar_url} />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {profile.full_name || user?.email}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Chia sẻ suy nghĩ của bạn...
                </p>
              </div>
            </div>
            <PostTitle title={title} setTitle={setTitle} />
          </div>

          {/* Content Editor */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors overflow-hidden">
            <div className="p-6">
              <div className="min-h-[400px]">
                <ReactQuill
                  ref={quillRef}
                  value={value}
                  onChange={setValue}
                  modules={modules}
                  placeholder="Bạn đang nghĩ gì?"
                  className="h-[350px]"
                  theme="snow"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <Button
                  onClick={triggerFileInput}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/50 dark:hover:bg-blue-900/70 text-blue-600 dark:text-blue-400 rounded-xl transition-colors"
                >
                  <FaImage className="w-4 h-4" />
                  <span className="font-medium">Ảnh</span>
                </Button>

                <Button
                  onClick={toggleEmojiPicker}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/50 dark:hover:bg-yellow-900/70 text-yellow-600 dark:text-yellow-400 rounded-xl transition-colors"
                >
                  <FaSmile className="w-4 h-4" />
                  <span className="font-medium">Emoji</span>
                </Button>

                <Button
                  onClick={insertLink}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/50 dark:hover:bg-green-900/70 text-green-600 dark:text-green-400 rounded-xl transition-colors"
                >
                  <FaLink className="w-4 h-4" />
                  <span className="font-medium">Liên kết</span>
                </Button>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors font-medium"
                >
                  <span>Hủy</span>
                </Button>
                <Button
                  onClick={handleSubmitPost}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-medium"
                >
                  <FaPaperPlane className="w-4 h-4" />
                  <span>Đăng bài</span>
                </Button>
              </div>
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute bottom-20 left-6 z-50 shadow-2xl rounded-2xl overflow-hidden"
              >
                <div className="relative">
                  <button
                    onClick={() => setShowEmojiPicker(false)}
                    className="absolute top-2 right-2 z-10 p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                  >
                    <FaTimes className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                  </button>
                  <EmojiPicker
                    onEmojiClick={onEmojiClick}
                    theme={isDark ? 'dark' : 'light'}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePostPage;
