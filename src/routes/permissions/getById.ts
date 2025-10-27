import { FastifyRequest, FastifyReply } from 'fastify';
import { PermissionService } from '../../services/PermissionService.js';

export const getPermissionById = async (request: FastifyRequest, reply: FastifyReply) => {
  const permissionService = new PermissionService();
  try {
    const { id } = request.params as { id: string };
    const permission = permissionService.getPermissionById(Number(id));
    if (!permission) {
      return reply.status(404).send({
        success: false,
        message: 'Permission not found',
        timestamp: new Date().toISOString()
      });
    }
    return {
      success: true,
      data: { permission },
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
