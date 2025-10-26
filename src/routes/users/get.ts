import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../../services/UserService.js';
import { RoleService } from '../../services/RoleService.js';
import { loggingService } from '../../services/index.js';
import { extractRequestContext, logSuccess, logError } from '../../utils/logging.js';
import type { UserResponse } from '../../types/index.js';

export const getUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const context = extractRequestContext(request);

  try {
    const { id } = request.params as { id: string };
    const userId = parseInt(id, 10);

    await loggingService.info('users', 'User retrieval requested', {
      ...context,
      requestedUserId: userId,
    });

    const userService = new UserService();
    const roleService = new RoleService();

    if (isNaN(userId)) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid user ID',
        timestamp: new Date().toISOString()
      });
    }

    const user = userService.getUserWithRole(userId);
    if (!user) {
      await loggingService.warn('users', 'User not found', {
        ...context,
        requestedUserId: userId,
      });

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

    // Log successful user retrieval
    await logSuccess('users', 'get user', context, {
      retrievedUserId: userId,
      retrievedUserEmail: user.email,
    });
  } catch (error: any) {
    // Log error
    await logError('users', 'get user', error, context, {
      requestedUserId: parseInt((request.params as { id: string }).id, 10),
    });

    console.error('Get user error:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to retrieve user',
      timestamp: new Date().toISOString()
    });
  }
};
