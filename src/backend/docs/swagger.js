const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Social Network API',
      version: '1.0.0',
      description: 'API Documentation for Social Network Application - Mạng xã hội sinh viên',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'https://daring-embrace-production.up.railway.app',
        description: 'Production server'
      },
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token stored in HTTP-only cookie'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            is_online: { type: 'boolean', example: true },
            last_active: { type: 'string', format: 'date-time' },
            full_name: { type: 'string', example: 'Nguyễn Văn A' },
            nickname: { type: 'string', example: 'vana' },
            avatar_url: { type: 'string', example: '/uploads/avatar-123.jpg' },
            bio: { type: 'string', example: 'Sinh viên IT' },
            birthday: { type: 'string', format: 'date', example: '2000-01-01' },
            address: { type: 'string', example: 'Hà Nội' },
            banner_url: { type: 'string', example: '/uploads/banner-123.jpg' }
          }
        },
        Post: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Bài viết mẫu' },
            content: { type: 'string', example: 'Nội dung bài viết' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            user_name: { type: 'string', example: 'Nguyễn Văn A' },
            avatar_url: { type: 'string', example: '/uploads/avatar-123.jpg' }
          }
        },
        Profile: {
          type: 'object',
          properties: {
            user_id: { type: 'integer', example: 1 },
            full_name: { type: 'string', example: 'Nguyễn Văn A' },
            nickname: { type: 'string', example: 'vana' },
            bio: { type: 'string', example: 'Sinh viên IT' },
            avatar_url: { type: 'string', example: '/uploads/avatar-123.jpg' },
            birthday: { type: 'string', format: 'date', example: '2000-01-01' },
            address: { type: 'string', example: 'Hà Nội' },
            banner_url: { type: 'string', example: '/uploads/banner-123.jpg' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Conversation: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Nhóm chat' },
            is_group: { type: 'boolean', example: false },
            avatar: { type: 'string', example: '/uploads/group-avatar.jpg' },
            created_at: { type: 'string', format: 'date-time' },
            last_message: { type: 'string', example: 'Tin nhắn cuối cùng' },
            last_message_time: { type: 'string', format: 'date-time' },
            unread_count: { type: 'integer', example: 2 }
          }
        },
        Message: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            conversation_id: { type: 'integer', example: 1 },
            sender_id: { type: 'integer', example: 1 },
            text: { type: 'string', example: 'Xin chào!' },
            message_type: { type: 'string', enum: ['text', 'image', 'file'], example: 'text' },
            attachment_url: { type: 'string', example: '/uploads/file-123.jpg' },
            created_at: { type: 'string', format: 'date-time' },
            is_read: { type: 'boolean', example: false }
          }
        },
        FriendRequest: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            sender_id: { type: 'integer', example: 1 },
            receiver_id: { type: 'integer', example: 2 },
            status: { type: 'string', enum: ['pending', 'accepted', 'declined'], example: 'pending' },
            created_at: { type: 'string', format: 'date-time' },
            sender_name: { type: 'string', example: 'Nguyễn Văn A' },
            receiver_name: { type: 'string', example: 'Trần Thị B' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            type: { type: 'string', example: 'friend_request' },
            title: { type: 'string', example: 'Lời mời kết bạn' },
            message: { type: 'string', example: 'Bạn có lời mời kết bạn mới' },
            data: { type: 'object', example: { friend_id: 2 } },
            is_read: { type: 'boolean', example: false },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Error message' }
          }
        }
      }
    },
    security: [
      {
        cookieAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './docs/swagger-paths.js',
    './docs/swagger-paths-2.js',
    './docs/swagger-paths-3.js',
    './docs/swagger-paths-4.js',
    './docs/swagger-paths-5.js'
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;