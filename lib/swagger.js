// lib/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Northwind Test Platform API',
      version: '1.0.0',
      description: 'API completa para gerenciamento de produtos com Supabase + Next.js',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor Local',
      },
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string', example: 'Mouse Gamer RGB' },
            price: { type: 'number', example: 299.90 },
            stock_quantity: { type: 'integer', example: 50 },
            sku: { type: 'string', example: 'MGP-2024' },
            category_id: { type: 'integer', nullable: true },
            supplier_id: { type: 'integer', nullable: true },
            slug: { type: 'string', example: 'mouse-gamer-rgb' },
            categories: {
              type: 'object',
              properties: { name: { type: 'string' } },
            },
            suppliers: {
              type: 'object',
              properties: { company_name: { type: 'string' } },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            data: { type: 'object', nullable: true },
            message: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./app/api/**/*.js'], // Lê os comentários JSDoc
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;