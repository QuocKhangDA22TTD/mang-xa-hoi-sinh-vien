import { memo } from 'react';
import { FaSpinner } from 'react-icons/fa';

const ChatMessages = memo(function ChatMessages({
  messages,
  loading,
  currentUser,
  messagesEndRef,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Đang tải tin nhắn...
          </p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
          </p>
        </div>
      </div>
    );
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message, index) => {
    const date = new Date(message.sent_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }

    // Debug: Check for missing IDs
    if (!message.id) {
      console.warn('⚠️ Message without ID at index', index, message);
    }

    groups[date].push(message);
    return groups;
  }, {});

  // Debug: Check for duplicate IDs
  const allIds = messages.map((m) => m.id).filter(Boolean);
  const uniqueIds = new Set(allIds);
  if (allIds.length !== uniqueIds.size) {
    console.warn('⚠️ Duplicate message IDs detected:', allIds);
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {Object.entries(groupedMessages).map(([date, dayMessages]) => (
        <div key={`date-${date}`}>
          {/* Date separator */}
          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              <span className="text-xs text-gray-600 dark:text-gray-300">
                {formatDate(dayMessages[0].sent_at)}
              </span>
            </div>
          </div>

          {/* Messages for this date */}
          <div className="space-y-3">
            {dayMessages.map((message, index) => {
              const isOwn = message.sender_id === currentUser?.id;
              const showAvatar =
                !isOwn &&
                (index === 0 ||
                  dayMessages[index - 1]?.sender_id !== message.sender_id);

              // Ensure unique key
              const uniqueKey = message.id
                ? `msg-${message.id}`
                : `msg-${date}-${index}`;

              return (
                <div
                  key={uniqueKey}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${
                    showAvatar ? 'mt-4' : 'mt-1'
                  }`}
                >
                  {/* Avatar for received messages */}
                  {!isOwn && (
                    <div className="w-8 h-8 mr-2 flex-shrink-0">
                      {showAvatar ? (
                        <img
                          src={message.sender_avatar || '/demo-avatar.svg'}
                          alt={message.sender_name || 'User'}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = '/demo-avatar.svg';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8"></div>
                      )}
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                    } ${message.sending ? 'opacity-70' : ''}`}
                  >
                    {/* Sender name for group chats */}
                    {!isOwn && showAvatar && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {message.sender_name ||
                          message.sender_email ||
                          'Unknown User'}
                      </p>
                    )}

                    {/* Message content */}
                    {/* Debug: Log message data */}
                    {console.log('🔍 ChatMessages - Message data:', {
                      id: message.id,
                      text: message.text,
                      message_type: message.message_type,
                      attachment_url: message.attachment_url,
                    })}

                    {message.message_type === 'image' &&
                    message.attachment_url ? (
                      <div className="space-y-2">
                        <img
                          src={message.attachment_url}
                          alt="Shared image"
                          className="max-w-full h-auto rounded-lg cursor-pointer max-h-64"
                          onClick={() =>
                            window.open(message.attachment_url, '_blank')
                          }
                          onError={(e) => {
                            console.error('Image load error:', e);
                            e.target.style.display = 'none';
                          }}
                        />
                        {message.text && (
                          <p className="text-sm break-words">{message.text}</p>
                        )}
                      </div>
                    ) : message.message_type === 'file' &&
                      message.attachment_url ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 p-2 bg-white bg-opacity-20 rounded">
                          <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {message.text || 'File attachment'}
                            </p>
                            <a
                              href={message.attachment_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs underline hover:no-underline"
                            >
                              Download
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm break-words">{message.text}</p>
                    )}

                    {/* Time and status */}
                    <div className="flex items-center justify-end mt-1 space-x-1">
                      <span
                        className={`text-xs ${
                          isOwn
                            ? 'text-blue-100'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {formatTime(message.sent_at)}
                      </span>

                      {/* Sending indicator */}
                      {message.sending && (
                        <FaSpinner className="w-3 h-3 text-blue-200 animate-spin" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
});

export default ChatMessages;
