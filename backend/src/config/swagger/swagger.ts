import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'vSaaS API',
      version: '1.0.0',
      description: 'Vertical SaaS platform API',
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
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'vsaas_access_token' },
      },
    },
  },
  apis: ['./src/routes/**/*.ts', './src/platform/**/routes/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
