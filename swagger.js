const swaggerJsdoc = require('swagger-jsdoc')

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Sawweq API',
            version: '1.0.0',
            description: 'Admin Dashboard API for Sawweq marketplace',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./routes/*.js'],
}

module.exports = swaggerJsdoc(options)