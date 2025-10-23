import { FastifyPluginAsync } from 'fastify';
import { AuthService } from '../services/AuthService.js';
import { LoginRequest } from '../types/index.js';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const authService = new AuthService();

  // POST /api/login
  fastify.post('/api/login', async (request, reply) => {
    const body = request.body as LoginRequest;
    const result = await authService.login(body);
    if (result.success) {
      reply.send(result);
    } else {
      reply.status(401).send(result);
    }
  });
};

export default authRoutes;
