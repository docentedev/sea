import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../../services/UserService.js';
import { loggingService } from '../../services/index.js';
import { extractRequestContext, logSuccess, logError, logUserOperation } from '../../utils/logging.js';
import { AuthUser } from '../../types/index.js';

export const deleteUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const context = extractRequestContext(request);

  try {
    const { id } = request.params as { id: string };
    const userId = parseInt(id, 10);
    const authUser = request.user as AuthUser;

    await loggingService.info('users', 'User deletion requested', {
      ...context,
      targetUserId: userId,
    });

    const userService = new UserService();

    if (isNaN(userId)) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid user ID',
        timestamp: new Date().toISOString()
      });
    }

    // No permitir que un usuario se elimine a sí mismo
    if (userId === authUser.id) {
      await loggingService.warn('users', 'User attempted to delete own account', {
        ...context,
        targetUserId: userId,
      });

      return reply.status(400).send({
        success: false,
        message: 'Cannot delete your own account',
        timestamp: new Date().toISOString()
      });
    }

    // Verificar que el usuario existe
    const existingUser = userService.getUserById(userId);
    if (!existingUser) {
      await loggingService.warn('users', 'User not found for deletion', {
        ...context,
        targetUserId: userId,
      });

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

    // Log successful user deletion
    await logUserOperation('deleted', userId, existingUser.email, context, {
      deletedUser: {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
      },
    });
  } catch (error: any) {
    // Log error
    await logError('users', 'delete user', error, context, {
      targetUserId: parseInt((request.params as { id: string }).id, 10),
    });

    console.error('Delete user error:', error);
    reply.status(500).send({
      success: false,
      message: error.message || 'Failed to delete user',
      timestamp: new Date().toISOString()
    });
  }
};
