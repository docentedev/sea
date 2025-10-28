import { FastifyPluginAsync } from 'fastify';
import { AuthUser } from '../../types/index.js';
import { requireAuth, requireAdmin } from '../../middlewares/auth.js';
import { listRoles } from './list.js';
import { getRolePermissions, setRolePermissions } from './permissions.js';
import { createRole } from './create.js';
import { updateRole } from './update.js';
import { deleteRole } from './delete.js';

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
  fastify.post('/api/roles', { preHandler: [requireAuth, requireAdmin] }, createRole);
  fastify.put('/api/roles/:id', { preHandler: [requireAuth, requireAdmin] }, updateRole);
  fastify.delete('/api/roles/:id', { preHandler: [requireAuth, requireAdmin] }, deleteRole);
  fastify.get('/api/roles/:id/permissions', getRolePermissions);
  fastify.put('/api/roles/:id/permissions', setRolePermissions);
};

export default roleRoutes;