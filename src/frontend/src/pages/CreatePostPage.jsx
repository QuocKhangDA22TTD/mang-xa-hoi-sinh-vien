import { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import EmojiPicker from 'emoji-picker-react';
import PostTitle from '../features/post/PostTitle';
import Avatar from '../features/post/Avatar';
import Button from '../components/Button';

function CreatePostPage() {
  const [value, setValue] = useState('');
  const [title, setTitle] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const quillRef = useRef();
  const fileInputRef = useRef();

  const handleSubmitPost = async () => {
    const postData = {
      user_id: 1,
      title: title,
      content: value,
    };

    try {
      const res = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!res.ok) throw new Error('Gửi bài thất bại');
      const result = await res.json();
      console.log('Đăng thành công:', result);
      alert('Đăng bài thành công');
      setTitle('');
      setValue('');
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
      const res = await fetch('http://localhost:5000/api/upload', {
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

  // Tùy chỉnh toolbar: chỉ giữ các chức năng cơ bản
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
    ],
  };

  return (
    <div className="w-full h-[40rem] bg-gradient-to-b from-[#FFFFFF] to-[#00A6FB]">
      <div className="flex gap-x-4 justify-center items-center w-full h-[20%] bg-[#0582CA]">
        <Avatar />
        <PostTitle title={title} setTitle={setTitle} />
      </div>

      <div className="flex justify-center items-center w-full h-[60%]">
        <div className="p-2 w-[95%] h-[90%] bg-[#EEEBD3] rounded-[10px] overflow-auto shadow-[0_0_2px_2px_rgba(0,0,0,0.25)]">
          <ReactQuill
            ref={quillRef}
            value={value}
            onChange={setValue}
            modules={modules}
            className="h-[85%]"
          />
        </div>
      </div>

      <div className="flex gap-x-4 items-center w-full h-[20%] bg-[#EEEBD3]">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />

        <Button
          onClick={triggerFileInput}
          className="mx-4 w-[10rem] h-[4rem] text-[1.25rem] bg-[#A98743] rounded-[10px] text-white"
        >
          TẢI ẢNH
        </Button>
        <Button
          onClick={toggleEmojiPicker}
          className="mx-4 w-[10rem] h-[4rem] text-[1.25rem] bg-[#A28497] rounded-[10px] text-white"
        >
          EMOJI
        </Button>

        {showEmojiPicker && (
          <div className="absolute bottom-[6rem] left-[2rem] z-50">
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}

        <Button
          onClick={insertLink}
          className="mx-4 w-[10rem] h-[4rem] text-[1.25rem] bg-[#006494] rounded-[10px] text-white"
        >
          LINK
        </Button>
        <Button
          onClick={handleSubmitPost}
          className="ml-auto mx-4 w-[10rem] h-[4rem] text-[1.25rem] bg-[#00A6FB] rounded-[10px] text-white"
        >
          ĐĂNG BÀI
        </Button>
      </div>
    </div>
  );
}

export default CreatePostPage;
