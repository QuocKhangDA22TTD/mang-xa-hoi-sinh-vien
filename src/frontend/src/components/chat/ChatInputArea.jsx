import { useState } from 'react';
import {
  FaPaperPlane,
  FaSmile,
  FaPaperclip,
  FaSpinner,
} from 'react-icons/fa';

function ChatInputArea({
  message,
  onMessageChange,
  onSend,
  onKeyPress,
  sending,
  disabled,
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSend = () => {
    if (message.trim() && !sending && !disabled) {
      onSend();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center space-x-3">
        {/* Attachment button */}
        <button
          disabled={disabled || sending}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPaperclip className="w-4 h-4" />
        </button>

        {/* Message input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder={disabled ? "Chọn cuộc trò chuyện để nhắn tin..." : "Nhập tin nhắn..."}
            disabled={disabled || sending}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Emoji button */}
        <button
          disabled={disabled || sending}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaSmile className="w-4 h-4" />
        </button>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled || sending}
          className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {sending ? (
            <FaSpinner className="w-4 h-4 animate-spin" />
          ) : (
            <FaPaperPlane className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Emoji picker placeholder */}
      {showEmojiPicker && (
        <div className="absolute bottom-full right-4 mb-2 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Emoji picker sẽ được thêm vào sau
          </p>
        </div>
      )}
    </div>
  );
}

export default ChatInputArea;
