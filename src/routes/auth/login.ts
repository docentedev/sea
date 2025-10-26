import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../../services/AuthService.js';
import { LoginRequest } from '../../types/index.js';

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = request.body as LoginRequest;
  const authService = new AuthService();
  const result = await authService.login(body);
  if (result.success) {
    reply.send(result);
  } else {
    reply.status(401).send(result);
  }
};
