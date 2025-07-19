import { useEffect, useState, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaSmile, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { getMyConversations, getMessages, sendMessage } from '../api/chat';

function ChatPage() {
  const socket = useSocket();
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations khi component mount
  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      try {
        setLoadingConversations(true);
        const data = await getMyConversations();
        setConversations(data);
      } catch (error) {
        console.error('Lỗi khi tải cuộc trò chuyện:', error);
      } finally {
        setLoadingConversations(false);
      }
    };

    loadConversations();
  }, [user]);

  // Socket.io listeners
  useEffect(() => {
    if (!socket || !user) return;

    // Join room với user ID
    socket.emit('join', user.id);

    const handleReceive = (msg) => {
      console.log('Received message:', msg);
      setMessages((prev) => [
        ...prev,
        {
          id: msg.id || Date.now(),
          text: msg.text,
          sender: msg.sender_id === user.id ? 'me' : 'other',
          time: new Date(msg.sent_at || Date.now()).toLocaleTimeString(
            'vi-VN',
            {
              hour: '2-digit',
              minute: '2-digit',
            }
          ),
          sender_email: msg.sender_email,
        },
      ]);
    };

    socket.on('receive_message', handleReceive);
    return () => socket.off('receive_message', handleReceive);
  }, [socket, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !socket || !selectedChat || !user) return;

    const messageData = {
      id: Date.now(),
      text: newMessage,
      sender: 'me',
      time: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // Hiển thị tin nhắn ngay lập tức
    setMessages((prev) => [...prev, messageData]);

    try {
      // Gửi tin nhắn qua API
      await sendMessage(selectedChat.id, newMessage);

      // Gửi tin nhắn qua socket để real-time
      socket.emit('send_message', {
        conversation_id: selectedChat.id,
        sender_id: user.id,
        text: newMessage,
        receiver_id: selectedChat.other_user_id, // Cần thêm field này từ backend
      });

      setNewMessage('');
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      // Xóa tin nhắn khỏi UI nếu gửi thất bại
      setMessages((prev) => prev.filter((msg) => msg.id !== messageData.id));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectChat = async (conversation) => {
    setSelectedChat(conversation);
    setLoadingMessages(true);

    try {
      const messagesData = await getMessages(conversation.id);
      const formattedMessages = messagesData.map((msg) => ({
        id: msg.id,
        text: msg.text,
        sender: msg.sender_id === user.id ? 'me' : 'other',
        time: new Date(msg.sent_at).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        sender_email: msg.sender_email,
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Lỗi khi tải tin nhắn:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Hiển thị loading khi đang xác thực user
  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-b from-[#FFFFFF] to-[#00A6FB] items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-[#0582CA] text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#FFFFFF] to-[#00A6FB]">
      {/* Sidebar - Danh sách cuộc trò chuyện */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="bg-[#0582CA] text-white p-4 flex items-center">
          <FaArrowLeft className="mr-3 cursor-pointer hover:text-gray-200" />
          <h2 className="text-xl font-semibold">Tin nhắn</h2>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0582CA]"
          />
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="flex justify-center items-center h-full">
              <FaSpinner className="animate-spin text-[#0582CA] text-2xl" />
              <span className="ml-2 text-gray-600">
                Đang tải cuộc trò chuyện...
              </span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full text-gray-500">
              <p>Bạn chưa có cuộc trò chuyện nào</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => selectChat(conv)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChat?.id === conv.id ? 'bg-[#E3F2FD]' : ''
                }`}
              >
                <div className="flex items-center">
                  <img
                    src={conv.avatar || 'demo_avatar.jpg'}
                    alt={conv.name || 'User'}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">
                        {conv.name || conv.email || 'Người dùng'}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {conv.last_message_time
                          ? new Date(conv.last_message_time).toLocaleTimeString(
                              'vi-VN',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )
                          : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {conv.last_message || 'Chưa có tin nhắn'}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="bg-[#0582CA] text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b p-4 flex items-center shadow-sm">
              <img
                src={selectedChat.avatar}
                alt={selectedChat.name}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <h3 className="font-semibold text-gray-800">
                  {selectedChat.name}
                </h3>
                <p className="text-sm text-green-500">Đang hoạt động</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#F5F5F5]">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <FaSpinner className="animate-spin text-[#0582CA] text-2xl" />
                  <span className="ml-2 text-gray-600">
                    Đang tải tin nhắn...
                  </span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-gray-500">
                  <p>Chưa có tin nhắn nào</p>
                  <p className="text-sm mt-2">Hãy bắt đầu cuộc trò chuyện!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender !== 'me' && (
                      <div className="flex-shrink-0 mr-2">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs text-white">
                          {message.sender_email
                            ? message.sender_email.charAt(0).toUpperCase()
                            : '?'}
                        </div>
                      </div>
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'me'
                          ? 'bg-[#0582CA] text-white'
                          : 'bg-white text-gray-800 border'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === 'me'
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}
                      >
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t p-4">
              <div className="flex items-center space-x-2">
                <button className="text-gray-500 hover:text-[#0582CA] transition-colors">
                  <FaSmile size={20} />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#0582CA] max-h-20"
                    rows="1"
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className={`p-3 rounded-lg transition-colors ${
                    newMessage.trim()
                      ? 'bg-[#0582CA] text-white hover:bg-[#0571B8]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaPaperPlane size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-[#F5F5F5]">
            <div className="text-center">
              <div className="text-6xl text-gray-300 mb-4">💬</div>
              <h3 className="text-xl text-gray-600 mb-2">
                Chọn một cuộc trò chuyện
              </h3>
              <p className="text-gray-500">
                Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn
                tin
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
