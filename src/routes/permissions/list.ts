import { FastifyRequest, FastifyReply } from 'fastify';
import { PermissionService } from '../../services/PermissionService.js';

export const listPermissions = async (request: FastifyRequest, reply: FastifyReply) => {
  const permissionService = new PermissionService();
  try {
    const permissions = permissionService.getAllPermissions();
    return {
      success: true,
      data: { permissions },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};
