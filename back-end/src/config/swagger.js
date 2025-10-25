const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Tài liệu',
      version: '1.0.0',
      description: 'Tài liệu API cho hệ thống đăng ký khóa học ngoại ngữ',
    },
    servers: [
      {
        url: 'http://localhost:3005/api',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
