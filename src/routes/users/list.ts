import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../../services/UserService.js';
import { loggingService } from '../../services/index.js';
import { extractRequestContext, logSuccess, logError } from '../../utils/logging.js';
import type { UsersListResponse } from '../../types/index.js';

export const listUsers = async (request: FastifyRequest, reply: FastifyReply) => {
  require('fs').appendFileSync('/tmp/debug.log', `DEBUG listUsers - Function called at ${new Date().toISOString()}\n`);
  const context = extractRequestContext(request);
  require('fs').appendFileSync('/tmp/debug.log', `DEBUG listUsers - Context extracted: ${JSON.stringify(context)}\n`);

  const { page = '1', limit = '10', q: searchQuery = '' } = request.query as {
    page?: string;
    limit?: string;
    q?: string;
  };

  try {
    await loggingService.info('users', 'User list requested', {
      ...context,
      page,
      limit,
      searchQuery: searchQuery || null,
    });

    const userService = new UserService();

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const trimmedSearchQuery = searchQuery.trim();

    console.log('🔍 Search query received:', { q: searchQuery, trimmedSearchQuery, fullQuery: request.query });

    // Validar parámetros de paginación
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid pagination parameters',
        timestamp: new Date().toISOString()
      });
    }

    let users = userService.getAllUsersWithRoles(trimmedSearchQuery);

    const total = users.length;
    const offset = (pageNum - 1) * limitNum;
    const paginatedUsers = users.slice(offset, offset + limitNum);

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
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      },
      timestamp: new Date().toISOString()
    };

    reply.send({
      success: true,
      data: response,
      timestamp: new Date().toISOString()
    });

    // Log successful user list
    await logSuccess('users', 'list users', context, {
      totalUsers: total,
      returnedUsers: paginatedUsers.length,
      page: pageNum,
      limit: limitNum,
      hasSearch: !!trimmedSearchQuery,
    });
  } catch (error: any) {
    // Log error
    await logError('users', 'list users', error, context, {
      page,
      limit,
      searchQuery,
    });

    console.error('Get users error:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to retrieve users',
      timestamp: new Date().toISOString()
    });
  }
};
