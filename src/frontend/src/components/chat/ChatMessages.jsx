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
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.sent_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {Object.entries(groupedMessages).map(([date, dayMessages]) => (
        <div key={date}>
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

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${
                    showAvatar ? 'mt-4' : 'mt-1'
                  }`}
                >
                  {/* Avatar for received messages */}
                  {!isOwn && (
                    <div className="w-8 h-8 mr-2 flex-shrink-0">
                      {showAvatar ? (
                        <img
                          src="/demo-avatar.svg"
                          alt="Avatar"
                          className="w-8 h-8 rounded-full object-cover"
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
                        {message.sender_email}
                      </p>
                    )}

                    {/* Message text */}
                    <p className="text-sm break-words">{message.text}</p>

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
