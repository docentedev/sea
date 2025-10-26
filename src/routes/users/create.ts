import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../../services/UserService.js';
import { RoleService } from '../../services/RoleService.js';
import { loggingService } from '../../services/index.js';
import { extractRequestContext, logSuccess, logError, logUserOperation } from '../../utils/logging.js';
import type { RegisterUserRequest, UserResponse } from '../../types/index.js';

export const createUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const context = extractRequestContext(request);

  try {
    await loggingService.info('users', 'User creation started', {
      ...context,
      requestedUsername: (request.body as RegisterUserRequest).username,
      requestedEmail: (request.body as RegisterUserRequest).email,
    });

    const body = request.body as RegisterUserRequest;
    const userService = new UserService();
    const roleService = new RoleService();

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

    // Log successful user creation
    await logUserOperation('created', newUser.id, newUser.email, context, {
      role: role.name,
      storageQuotaGb: response.storage_quota_gb,
    });
  } catch (error: any) {
    // Log error
    await logError('users', 'create user', error, context, {
      requestedUsername: (request.body as RegisterUserRequest)?.username,
      requestedEmail: (request.body as RegisterUserRequest)?.email,
    });

    console.error('Create user error:', error);
    reply.status(400).send({
      success: false,
      message: error.message || 'Failed to create user',
      timestamp: new Date().toISOString()
    });
  }
};
