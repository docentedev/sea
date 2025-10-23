import { FastifyPluginAsync } from 'fastify';
import { HealthResponse } from '../types';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  // Schema para validación y documentación
  const healthSchema = {
    description: 'Health check endpoint',
    tags: ['health'],
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          timestamp: { type: 'string' },
          uptime: { type: 'number' },
          version: { type: 'string' },
          memory: {
            type: 'object',
            properties: {
              rss: { type: 'number' },
              heapTotal: { type: 'number' },
              heapUsed: { type: 'number' },
              external: { type: 'number' },
              arrayBuffers: { type: 'number' },
            },
          },
          database: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              message: { type: 'string' },
              latency: { type: 'number' },
              stats: {
                type: 'object',
                properties: {
                  total_users: { type: 'number' },
                  active_users: { type: 'number' },
                  total_roles: { type: 'number' },
                  total_storage_used_gb: { type: 'number' },
                  database_size_mb: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  };

  fastify.get<{ Reply: HealthResponse }>('/health', { schema: healthSchema }, async (request, reply) => {
    const health = fastify.systemService.getHealth();
    
    reply
      .code(200)
      .type('application/json')
      .send(health);
  });
};

export default healthRoutes;