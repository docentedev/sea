import { FastifyPluginAsync } from 'fastify';
import { UserService } from '../services/UserService.js';
import { AuthService } from '../services/AuthService.js';
import { RoleService } from '../services/RoleService.js';
import {
  RegisterUserRequest,
  UpdateUserRequest,
  UserResponse,
  UsersListResponse,
  AuthUser
} from '../types/index.js';

// Extender la interfaz de FastifyRequest para incluir el usuario autenticado
declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

const userRoutes: FastifyPluginAsync = async (fastify) => {
  const userService = new UserService();
  const authService = new AuthService();
  const roleService = new RoleService();

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

    console.log('✅ Token verified for user:', user.username);
    request.user = user;
  };

  // Middleware para verificar permisos de admin
  const requireAdmin = async (request: any, reply: any) => {
    if (!authService.isAdmin(request.user)) {
      return reply.status(403).send({
        success: false,
        message: 'Admin privileges required',
        timestamp: new Date().toISOString()
      });
    }
  };

  // POST /api/users - Register new user (admin only)
  fastify.post('/api/users', {
    preHandler: [requireAuth, requireAdmin]
  }, async (request, reply) => {
    try {
      const body = request.body as RegisterUserRequest;
      const authUser = request.user as AuthUser;

      // Validar datos requeridos
      if (!body.username || !body.email || !body.password || !body.role) {
        return reply.status(400).send({
          success: false,
          message: 'Username, email, password and role are required',
          timestamp: new Date().toISOString()
        });
      }

      // Obtener role_id desde el nombre del rol
      const role = roleService.getRoleById(body.role);
      if (!role) {
        return reply.status(400).send({
          success: false,
          message: `Role '${body.role}' not found`,
          timestamp: new Date().toISOString()
        });
      }

      // Crear usuario
      const newUser = userService.createUser({
        username: body.username,
        email: body.email,
        password_hash: body.password, // En producción usar bcrypt
        role_id: role.id,
        storage_quota_gb: body.storageQuotaGb || role.max_storage_gb
      });

      // Obtener usuario con información del rol
      const userWithRole = userService.getUserWithRole(newUser.id);
      if (!userWithRole) {
        throw new Error('Failed to retrieve created user');
      }

      const response: UserResponse = {
        id: userWithRole.id,
        username: userWithRole.username,
        email: userWithRole.email,
        role: {
          id: role.id,
          name: role.name,
          display_name: role.display_name,
          permissions: role.permissions
        },
        storage_quota_gb: userWithRole.storage_quota_gb,
        storage_used_gb: userWithRole.storage_used_gb,
        is_active: userWithRole.is_active,
        created_at: userWithRole.created_at,
        updated_at: userWithRole.updated_at
      };

      reply.status(201).send({
        success: true,
        data: response,
        message: 'User created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Create user error:', error);
      reply.status(400).send({
        success: false,
        message: error.message || 'Failed to create user',
        timestamp: new Date().toISOString()
      });
    }
  });

  // GET /api/users - Get all users with pagination (admin only)
  fastify.get('/api/users', {
    preHandler: [requireAuth, requireAdmin]
  }, async (request, reply) => {
    try {
      const query = request.query as any;
      const page = parseInt(query.page || '1', 10);
      const limit = parseInt(query.limit || '10', 10);

      // Validar parámetros de paginación
      if (page < 1 || limit < 1 || limit > 100) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid pagination parameters',
          timestamp: new Date().toISOString()
        });
      }

      const offset = (page - 1) * limit;
      const users = userService.getAllUsersWithRoles();
      const total = users.length;
      const paginatedUsers = users.slice(offset, offset + limit);

      const response: UsersListResponse = {
        users: paginatedUsers.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          role: {
            id: user.role_id,
            name: user.role_name,
            display_name: user.role_name, // TODO: Get from role table
            permissions: user.role_permissions
          },
          storage_quota_gb: user.storage_quota_gb,
          storage_used_gb: user.storage_used_gb,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        timestamp: new Date().toISOString()
      };

      reply.send({
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Get users error:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to retrieve users',
        timestamp: new Date().toISOString()
      });
    }
  });

  // GET /api/users/:id - Get user by ID (admin only)
  fastify.get('/api/users/:id', {
    preHandler: [requireAuth, requireAdmin]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = parseInt(id, 10);

      if (isNaN(userId)) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid user ID',
          timestamp: new Date().toISOString()
        });
      }

      const user = userService.getUserWithRole(userId);
      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
      }

      const role = roleService.getRoleById(user.role_id);
      if (!role) {
        throw new Error('User role not found');
      }

      const response: UserResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: {
          id: role.id,
          name: role.name,
          display_name: role.display_name,
          permissions: role.permissions
        },
        storage_quota_gb: user.storage_quota_gb,
        storage_used_gb: user.storage_used_gb,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at
      };

      reply.send({
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Get user error:', error);
      reply.status(500).send({
        success: false,
        message: 'Failed to retrieve user',
        timestamp: new Date().toISOString()
      });
    }
  });

  // PUT /api/users/:id - Update user (admin only)
  fastify.put('/api/users/:id', {
    preHandler: [requireAuth, requireAdmin]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = parseInt(id, 10);
      const body = request.body as UpdateUserRequest;

      if (isNaN(userId)) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid user ID',
          timestamp: new Date().toISOString()
        });
      }

      // Verificar que el usuario existe
      const existingUser = userService.getUserById(userId);
      if (!existingUser) {
        return reply.status(404).send({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
      }

      // Preparar datos de actualización
      const updateData: any = {};

      if (body.username) updateData.username = body.username;
      if (body.email) updateData.email = body.email;
      if (body.password) updateData.password_hash = body.password; // En producción usar bcrypt
      if (body.role) {
        const role = roleService.getRoleById(body.role);
        if (!role) {
          return reply.status(400).send({
            success: false,
            message: `Role '${body.role}' not found`,
            timestamp: new Date().toISOString()
          });
        }
        updateData.role_id = role.id;
      }
      if (body.storageQuotaGb !== undefined) updateData.storage_quota_gb = body.storageQuotaGb;
      if (body.isActive !== undefined) updateData.is_active = body.isActive;

      // Actualizar usuario
      const updatedUser = userService.updateUser(userId, updateData);
      if (!updatedUser) {
        throw new Error('Failed to update user');
      }

      // Obtener usuario actualizado con rol
      const userWithRole = userService.getUserWithRole(userId);
      if (!userWithRole) {
        throw new Error('Failed to retrieve updated user');
      }

      const role = roleService.getRoleById(userWithRole.role_id);
      if (!role) {
        throw new Error('User role not found');
      }

      const response: UserResponse = {
        id: userWithRole.id,
        username: userWithRole.username,
        email: userWithRole.email,
        role: {
          id: role.id,
          name: role.name,
          display_name: role.display_name,
          permissions: role.permissions
        },
        storage_quota_gb: userWithRole.storage_quota_gb,
        storage_used_gb: userWithRole.storage_used_gb,
        is_active: userWithRole.is_active,
        created_at: userWithRole.created_at,
        updated_at: userWithRole.updated_at
      };

      reply.send({
        success: true,
        data: response,
        message: 'User updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Update user error:', error);
      reply.status(400).send({
        success: false,
        message: error.message || 'Failed to update user',
        timestamp: new Date().toISOString()
      });
    }
  });

  // DELETE /api/users/:id - Delete user (admin only)
  fastify.delete('/api/users/:id', {
    preHandler: [requireAuth, requireAdmin]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const userId = parseInt(id, 10);
      const authUser = request.user as AuthUser;

      if (isNaN(userId)) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid user ID',
          timestamp: new Date().toISOString()
        });
      }

      // No permitir que un usuario se elimine a sí mismo
      if (userId === authUser.id) {
        return reply.status(400).send({
          success: false,
          message: 'Cannot delete your own account',
          timestamp: new Date().toISOString()
        });
      }

      // Verificar que el usuario existe
      const existingUser = userService.getUserById(userId);
      if (!existingUser) {
        return reply.status(404).send({
          success: false,
          message: 'User not found',
          timestamp: new Date().toISOString()
        });
      }

      // Eliminar usuario
      const deleted = userService.deleteUser(userId);
      if (!deleted) {
        throw new Error('Failed to delete user');
      }

      reply.send({
        success: true,
        message: 'User deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Delete user error:', error);
      reply.status(500).send({
        success: false,
        message: error.message || 'Failed to delete user',
        timestamp: new Date().toISOString()
      });
    }
  });
};

export default userRoutes;