import { FastifyPluginAsync } from 'fastify';
import { AuthUser } from '../../types/index.js';
import { requireAuth, requireAdmin } from '../../middlewares/auth.js';
import { listRoles } from './list.js';

// Extender la interfaz de FastifyRequest para incluir el usuario autenticado
declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

const roleRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /api/roles - Obtener todos los roles
  fastify.get('/api/roles', {
    preHandler: [requireAuth, requireAdmin]
  }, listRoles);
};

export default roleRoutes;