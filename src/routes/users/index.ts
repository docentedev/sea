import { FastifyPluginAsync } from 'fastify';
import { AuthUser } from '../../types/index.js';
import { requireAuth, requireAdmin } from '../../middlewares/auth.js';
import { createUser } from './create';
import { listUsers } from './list';
import { getUser } from './get';
import { updateUser } from './update';
import { deleteUser } from './delete';

// Extender la interfaz de FastifyRequest para incluir el usuario autenticado
declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

const userRoutes: FastifyPluginAsync = async (fastify) => {

  // POST /api/users - Register new user (admin only)
  fastify.post('/api/users', {
    preHandler: [requireAuth, requireAdmin]
  }, createUser);

  // GET /api/users - Get all users with pagination and search (admin only)
  fastify.get('/api/users', {
    preHandler: [requireAuth, requireAdmin],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'string', default: '1' },
          limit: { type: 'string', default: '10' },
          q: { type: 'string' }
        }
      }
    }
  }, listUsers);

  // GET /api/users/:id - Get user by ID (admin only)
  fastify.get('/api/users/:id', {
    preHandler: [requireAuth, requireAdmin]
  }, getUser);

  // PUT /api/users/:id - Update user (admin only)
  fastify.put('/api/users/:id', {
    preHandler: [requireAuth, requireAdmin]
  }, updateUser);

  // DELETE /api/users/:id - Delete user (admin only)
  fastify.delete('/api/users/:id', {
    preHandler: [requireAuth, requireAdmin]
  }, deleteUser);
};

export default userRoutes;
