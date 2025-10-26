import { FastifyPluginAsync } from 'fastify';
import { InfoResponse } from '../../types';
import { getInfo } from './get.js';

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

  fastify.get<{ Reply: InfoResponse }>('/api/info', { schema: infoSchema }, getInfo);
};

export default infoRoutes;