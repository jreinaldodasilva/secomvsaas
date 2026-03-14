import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Secom API',
      version: '0.1.0',
      description: 'Sistema da Secretaria de Comunicação — API',
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === 'production'
            ? process.env.API_URL || ''
            : 'http://localhost:5000',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'secom_access_token' },
      },
    },
  },
  apis: ['./src/routes/**/*.ts', './src/platform/**/routes/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
