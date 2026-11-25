const swaggerUi = require('swagger-ui-express');

const swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: 'API Festivos Colombia',
        version: '1.0.0',
        description: 'Microservicio en ExpressJS + MongoDB para consultar y validar días festivos en Colombia (Ley Emiliani y Pascua).'
    },
    servers: [
        {
            url: '/',
            description: 'Servidor actual (Docker o Local, resuelve puerto dinámicamente)'
        }
    ],
    paths: {
        '/api/festivos/obtener/{year}': {
            get: {
                summary: 'Obtener lista de festivos de un año',
                parameters: [
                    {
                        name: 'year',
                        in: 'path',
                        required: true,
                        schema: { type: 'integer', example: 2027 },
                        description: 'Año a consultar'
                    }
                ],
                responses: {
                    200: { description: 'Lista de festivos calculados para el año' }
                }
            }
        },
        '/api/festivos/verificar/{year}/{month}/{day}': {
            get: {
                summary: 'Verificar si una fecha específica es festiva',
                parameters: [
                    { name: 'year', in: 'path', required: true, schema: { type: 'integer', example: 2027 } },
                    { name: 'month', in: 'path', required: true, schema: { type: 'integer', example: 7 } },
                    { name: 'day', in: 'path', required: true, schema: { type: 'integer', example: 20 } }
                ],
                responses: {
                    200: { description: 'Resultado de validación (Es Festivo / No es festivo / Fecha No válida)' }
                }
            }
        }
    }
};

function configurarSwagger(app) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = configurarSwagger;
