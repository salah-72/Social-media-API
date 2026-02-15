import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

export const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Social Media API Docs',
    version: '1.0.0',
    description: 'API documentation for my Social Media App',
    contact: {
      name: 'Social Media API Support',
      url: 'https://github.com/salah-72',
    },
  },
  servers: [
    {
      url: 'http://localhost:{port}',
      description: 'Development server',
      variables: {
        port: {
          default: '3000',
          description: 'Server port',
        },
      },
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error',
          },
          message: {
            type: 'string',
            example: 'Error message',
          },
        },
      },
      Success: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'success',
          },
          message: {
            type: 'string',
            example: 'Operation completed successfully',
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Auth',
      description: 'Authentication related endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'Posts',
      description: 'Post management endpoints',
    },
    {
      name: 'Comments',
      description: 'Comment management endpoints',
    },
    {
      name: 'Follow',
      description: 'Follow management endpoints',
    },
    {
      name: 'Stories',
      description: 'Story management endpoints',
    },
    {
      name: 'Blocks',
      description: 'Block and unblock endpoints',
    },
  ],
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/models/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
