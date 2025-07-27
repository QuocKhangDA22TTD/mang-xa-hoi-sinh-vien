import { memo, useMemo, useRef, useEffect, useState } from 'react';
import { FaFile } from 'react-icons/fa';

const ITEM_HEIGHT = 80; // Approximate height per message
const BUFFER_SIZE = 5; // Extra items to render outside viewport

const VirtualMessageList = memo(function VirtualMessageList({ 
  messages, 
  loading, 
  messagesEndRef, 
  currentUser 
}) {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const endIndex = Math.min(
      messages.length - 1,
      Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE
    );
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, messages.length]);

  // Get visible messages
  const visibleMessages = useMemo(() => {
    return messages.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [messages, visibleRange]);

  // Handle scroll
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Auto scroll to bottom for new messages
  useEffect(() => {
    if (containerRef.current && messages.length > 0) {
      const isNearBottom = scrollTop + containerHeight >= 
        (messages.length * ITEM_HEIGHT) - 100;
      
      if (isNearBottom) {
        containerRef.current.scrollTop = messages.length * ITEM_HEIGHT;
      }
    }
  }, [messages.length, scrollTop, containerHeight]);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải tin nhắn...</p>
          </div>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Chưa có tin nhắn nào
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Hãy bắt đầu cuộc trò chuyện!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalHeight = messages.length * ITEM_HEIGHT;
  const offsetY = visibleRange.startIndex * ITEM_HEIGHT;

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto"
      onScroll={handleScroll}
      style={{ height: '100%' }}
    >
      {/* Virtual container */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible messages */}
        <div 
          style={{ 
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleMessages.map((message, index) => {
            const actualIndex = visibleRange.startIndex + index;
            return (
              <div
                key={message.id}
                className={`flex p-4 ${
                  message.sender === 'me' ? 'justify-end' : 'justify-start'
                }`}
                style={{ minHeight: ITEM_HEIGHT }}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                    message.sender === 'me'
                      ? 'bg-blue-500 text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                  }`}
                >
                  {/* Message content */}
                  {message.message_type === 'image' && message.attachment_url ? (
                    <div>
                      <img
                        src={message.attachment_url}
                        alt="Shared image"
                        className="max-w-xs max-h-64 rounded-lg cursor-pointer hover:opacity-90"
                        onClick={() => window.open(message.attachment_url, '_blank')}
                      />
                      {message.text && <p className="mt-2">{message.text}</p>}
                    </div>
                  ) : message.message_type === 'file' && message.attachment_url ? (
                    <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-600 rounded">
                      <FaFile className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      <a
                        href={message.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        {message.text || 'File đính kèm'}
                      </a>
                    </div>
                  ) : (
                    <p>{message.text}</p>
                  )}

                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'me'
                        ? 'text-blue-100'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {message.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
});

export default VirtualMessageList;
