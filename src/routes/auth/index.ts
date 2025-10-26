import { FastifyPluginAsync } from 'fastify';
import { login } from './login';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/login
  fastify.post('/api/login', login);
};

export default authRoutes;
