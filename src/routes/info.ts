import { FastifyPluginAsync } from 'fastify';
import { InfoResponse } from '../types';

const infoRoutes: FastifyPluginAsync = async (fastify) => {
  const infoSchema = {
    description: 'System information endpoint',
    tags: ['system'],
    response: {
      200: {
        type: 'object',
        properties: {
          process: { type: 'object' },
          system: { type: 'object' },
          server: { type: 'object' },
        },
      },
    },
  };

  fastify.get<{ Reply: InfoResponse }>('/api/info', { schema: infoSchema }, async (request, reply) => {
    const info = fastify.systemService.getInfo();
    
    reply
      .code(200)
      .type('application/json')
      .send(info);
  });
};

export default infoRoutes;