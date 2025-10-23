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
          isSEA: { type: 'boolean' },
          version: { type: 'string' },
          performance: {
            type: 'object',
            properties: {
              memoryUsage: {
                type: 'object',
                properties: {
                  rss: { type: 'number' },
                  heapTotal: { type: 'number' },
                  heapUsed: { type: 'number' },
                  external: { type: 'number' },
                  arrayBuffers: { type: 'number' },
                },
              },
              cpuUsage: {
                type: 'object',
                properties: {
                  user: { type: 'number' },
                  system: { type: 'number' },
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