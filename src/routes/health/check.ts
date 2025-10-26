import { FastifyRequest, FastifyReply } from 'fastify';

export const healthCheck = async (request: FastifyRequest, reply: FastifyReply) => {
  const health = request.server.systemService.getHealth();

  reply
    .code(200)
    .type('application/json')
    .send(health);
};