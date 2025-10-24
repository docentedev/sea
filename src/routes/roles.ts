import { FastifyPluginAsync } from 'fastify';
import { RoleService } from '../services/RoleService.js';
import { AuthService } from '../services/AuthService.js';
import { AuthUser } from '../types/index.js';

// Extender la interfaz de FastifyRequest para incluir el usuario autenticado
declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

const roleRoutes: FastifyPluginAsync = async (fastify) => {
  const roleService = new RoleService();
  const authService = new AuthService();

  // Middleware para verificar autenticación
  const requireAuth = async (request: any, reply: any) => {
    console.log('🔐 Checking auth for request:', request.url);
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No authorization header found');
      return reply.status(401).send({
        success: false,
        message: 'Authorization header required',
        timestamp: new Date().toISOString()
      });
    }

    const token = authHeader.substring(7);
    console.log('🔑 Verifying token...');
    const user = authService.verifyToken(token);

    if (!user) {
      console.log('❌ Token verification failed');
      return reply.status(401).send({
        success: false,
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString()
      });
    }

    request.user = user;
  };

  // Middleware para verificar permisos de admin
  const requireAdmin = async (request: any, reply: any) => {
    if (!authService.isAdmin(request.user)) {
      console.log('❌ User does not have admin permissions');
      return reply.status(403).send({
        success: false,
        message: 'Admin privileges required',
        timestamp: new Date().toISOString()
      });
    }
  };

  // GET /api/roles - Obtener todos los roles
  fastify.get('/api/roles', {
    preHandler: [requireAuth, requireAdmin]
  }, async (request, reply) => {
    try {
      console.log('📋 Getting all roles');
      const roles = roleService.getAllRoles();

      console.log(`✅ Found ${roles.length} roles`);
      return {
        success: true,
        data: {
          roles: roles
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error getting roles:', error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    }
  });
};

export default roleRoutes;