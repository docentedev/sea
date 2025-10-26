import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../../services/UserService.js';
import { RoleService } from '../../services/RoleService.js';
import { loggingService } from '../../services/index.js';
import { extractRequestContext, logSuccess, logError, logUserOperation } from '../../utils/logging.js';
import type { UpdateUserRequest, UserResponse } from '../../types/index.js';

export const updateUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const context = extractRequestContext(request);

  try {
    const { id } = request.params as { id: string };
    const userId = parseInt(id, 10);
    const body = request.body as UpdateUserRequest;

    await loggingService.info('users', 'User update requested', {
      ...context,
      targetUserId: userId,
      updateFields: Object.keys(body),
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

    // Verificar que el usuario existe
    const existingUser = userService.getUserById(userId);
    if (!existingUser) {
      await loggingService.warn('users', 'User not found for update', {
        ...context,
        targetUserId: userId,
      });

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

    // Log successful user update
    await logUserOperation('updated', userId, existingUser.email, context, {
      updatedFields: Object.keys(updateData),
      oldValues: {
        username: existingUser.username,
        email: existingUser.email,
      },
      newValues: {
        username: response.username,
        email: response.email,
      },
    });
  } catch (error: any) {
    // Log error
    await logError('users', 'update user', error, context, {
      targetUserId: parseInt((request.params as { id: string }).id, 10),
      updateFields: Object.keys(request.body as UpdateUserRequest || {}),
    });

    console.error('Update user error:', error);
    reply.status(400).send({
      success: false,
      message: error.message || 'Failed to update user',
      timestamp: new Date().toISOString()
    });
  }
};
