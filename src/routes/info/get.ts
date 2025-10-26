import { FastifyRequest, FastifyReply } from 'fastify';

export const getInfo = async (request: FastifyRequest, reply: FastifyReply) => {
  const info = request.server.systemService.getInfo();

  reply
    .code(200)
    .type('application/json')
    .send(info);
};