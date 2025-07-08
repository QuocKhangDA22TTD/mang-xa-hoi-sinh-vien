const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'Tài liệu API sử dụng Swagger',
    },
    servers: [
      {
        url: 'http://localhost:3000', // chỉnh cổng nếu bạn dùng cổng khác
      },
    ],
  },
  apis: ['./routes/*.js'], // sau này bạn sẽ viết API trong thư mục này
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;