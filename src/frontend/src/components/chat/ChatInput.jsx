import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaPaperclip, FaSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';

function ChatInput({ onSendMessage, onSendFile, isUploading, disabled }) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (event) => {
    console.log('🔍 ChatInput - File select triggered');
    console.log('🔍 ChatInput - Files:', event.target.files);

    const file = event.target.files[0];
    console.log('🔍 ChatInput - Selected file:', file);
    console.log('🔍 ChatInput - onSendFile function:', typeof onSendFile);

    if (file && onSendFile) {
      console.log('✅ ChatInput - Calling onSendFile with:', file.name);
      onSendFile(file);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      console.warn('⚠️ ChatInput - No file or onSendFile missing');
    }
  };

  const handleFileButtonClick = () => {
    console.log('🔍 ChatInput - File button clicked');
    console.log('🔍 ChatInput - fileInputRef.current:', fileInputRef.current);

    if (fileInputRef.current) {
      console.log('✅ ChatInput - Triggering file input click');
      fileInputRef.current.click();
    } else {
      console.error('❌ ChatInput - fileInputRef.current is null');
    }
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Debug: Check file input ref on mount
  useEffect(() => {
    console.log('🔍 ChatInput - Component mounted');
    console.log('🔍 ChatInput - fileInputRef on mount:', fileInputRef.current);
    console.log('🔍 ChatInput - onSendFile prop:', typeof onSendFile);
  }, [onSendFile]);

  return (
    <div className="p-3 border-t border-gray-200 dark:border-gray-700 relative bg-white dark:bg-gray-800">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-full left-4 z-50 emoji-picker-container mb-2">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme="auto"
            width={280}
            height={350}
          />
        </div>
      )}

      <div className="flex items-center space-x-2">
        {/* File Upload Button */}
        <button
          onClick={handleFileButtonClick}
          disabled={isUploading || disabled}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 transition-colors"
          title="Gửi file"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          ) : (
            <FaPaperclip className="w-4 h-4" />
          )}
        </button>

        {/* Emoji Button */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Chọn emoji"
        >
          <FaSmile className="w-4 h-4" />
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar"
          className="hidden"
          multiple={false}
        />

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
        />

        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isUploading}
          className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-full transition-colors"
        >
          <FaPaperPlane className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
